import { BaseMgr } from "./BaseMgr";
import { TsrpcErrorType, WsClient } from "tsrpc-browser";
import { TransportOptions } from 'tsrpc-base-client';
import { serviceProto, ServiceType } from "../shared/protocols/serviceProto";
import { GameCfgNet } from "../common/config/GameCfgNet";
import { Const } from "../common/Const";
import { core } from "../core/InitCore";
import { mgr } from "./mgr";
import { LoginMgr } from "./LoginMgr";
import { MessageBox } from "../ui/common/MessageBox";
import { UIUtils } from "../ui/UIUtils";
import { RpcErrCode } from "../shared/RpcErr";
import { GameCfgMgr } from "./GameCfgMgr";

// 最大重连次数
const MaxConnectCount = 3;

export class RpcMgr extends BaseMgr
{
    // rpc client
    client: WsClient<ServiceType>;
    // 连接次数
    private connectNum = 0;
    // 是否自动重连
    private isReconnect = true;
    // 是否连接
    public isConnect = false;

    constructor() {
        super();

        this.client = new WsClient(serviceProto, {
            server: GameCfgNet.ServerURL,
            json: false
        })
        
        // 断开事件
        this.client.flows.postDisconnectFlow.push(v=>{
            this.isConnect = false;
            if(this.isReconnect) {
                this.connect();
            }
            return v;
        });
        
        // 被服务器踢出消息
        this.client.listenMsg("msg/SelfOffline", (msg => {
            mgr.getMgr(RpcMgr).showErrCode(msg.why);
            this.stopAutoReconnect();
        }));
    }

    /**
     * 连接服务器
     */
    async connect() {
        if(!core.ui.current().contain(Const.UIs.NetLoading)) {
            core.ui.current().pushUI(Const.UIs.NetLoading, null, null, 10);
        }

        this.isConnect = false;
        this.connectNum = 0;
        while (true) {
            let ret = await this.client.connect();
            if(ret.isSucc) {
                this.connectNum = 0;
                this.isConnect = true;             
                break;
            }
            else {
                this.connectNum++;
            }

            if(this.connectNum > MaxConnectCount) {
                break;
            }
        }

        cc.log(`this.connectNum = ${this.connectNum}`)
        // 连接成功
        if(this.connectNum <= 0) {
            mgr.getMgr(LoginMgr).loginGame();
        }
        else{
            core.ui.current().pushUI(Const.UIs.MessageBox, null, (node: cc.Node)=>{
                node.getComponent(MessageBox).showOne("服务器连接失败，请稍后再试", ()=>{
                    this.connect();
                });
            }, 10);
        }
    }

    /**
     * API调用
     * @param apiName 
     * @param req 
     * @param options 
     * @returns 
     */
    async callApi<T extends keyof ServiceType['api']>(apiName: T, req: ServiceType['api'][T]['req'], options?: TransportOptions) {
        let result = await this.client.callApi(apiName, req, options);
        if(!result.isSucc && result.err && result.err.type == TsrpcErrorType.ApiError) {
            // cc.error(result.err.message);
            if(typeof(result.err.code) == "number") {
                this.showErrCode(result.err.code, result.err.message);
            }
        }
        return result;
    }

    /**
     * 停止自动重连
     */
    stopAutoReconnect() {
        this.isReconnect = false;
    }

    showErrCode(code: number, message?: string) {
        let cfg = mgr.getMgr(GameCfgMgr).getData("RpcError", code);

        if(!cfg) {
            if(message && message != "") {
                UIUtils.showMsgBoxOne(message);
            }
            return;
        }

        // 0:不显示  1:显示弹窗  2:显示飘字 3:返回登录 4:结束游戏
        switch(cfg.showstyle){
            case 0: {}break;
            case 1: {
                UIUtils.showMsgBoxOne(cfg.desc);
            }break;
            case 2: {
                UIUtils.showMsgBoxOne(cfg.desc);
            }break;
            case 3: {
                UIUtils.showMsgBoxOne(cfg.desc);
            }break;
            case 4: {
                UIUtils.showMsgBoxOne(cfg.desc);
            }break;
        }
    }

    onDestroy(): void {
        this.client.abortAll();
        this.client.disconnect();
    }
}
