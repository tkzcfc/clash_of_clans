import { BaseMgr } from "./BaseMgr";
import { TsrpcErrorType, WsClient } from "tsrpc-browser";
import { serviceProto, ServiceType } from "../../shared/protocols/serviceProto";
import { GameCfgNet } from "../../common/config/GameCfgNet";
import { Const } from "../common/Const";
import { core } from "../../core/InitCore";
import { MessageBox } from "../ui/common/MessageBox";
import { UIUtils } from "../ui/UIUtils";
import { mgr } from "./mgr";
import { LoginMgr } from "./LoginMgr";

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

    constructor() {
        super();

        this.client = new WsClient(serviceProto, {
            server: GameCfgNet.ServerURL,
            json: false
        })
        
        // 断开事件
        this.client.flows.postDisconnectFlow.push(v=>{
            if(this.isReconnect) {
                this.connect();
            }
            return v;
        });
    }

    async connect() {
        if(!core.ui.current().contain(Const.UIs.NetLoading)) {
            core.ui.current().pushUI(Const.UIs.NetLoading, null, null, 10);
        }

        this.connectNum = 0;
        while (true) {
            let ret = await this.client.connect();
            if(ret.isSucc) {
                this.connectNum = 0;                
                break;
            }
            else {
                this.connectNum++;
            }

            if(this.connectNum > MaxConnectCount) {
                break;
            }
        }

        core.ui.current().popUI(Const.UIs.NetLoading);

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

    async callApi<T extends keyof ServiceType['api']>(apiName: T, req: ServiceType['api'][T]['req']) {
        let result = await this.client.callApi(apiName, req);
        if(!result.isSucc && result.err && result.err.type == TsrpcErrorType.ApiError) {
            cc.error(result.err.message);
            if(typeof(result.err.code) == "number") {
                this.showErrCode(result.err.code);
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

    showErrCode(code: number) {

    }


    //////////////////////////////////////////////// private ////////////////////////////////////////////////


    // async test() {

    //     let r = await this.client.connect();
    //     if(!r.isSucc) {
    //         cc.log("connect failed");
    //         cc.log(r.errMsg);
    //         return;
    //     }
    //     cc.log("connect success");

    //     let account = "";
    //     for(let i = 0; i < 1024 * 1024; ++i) {
    //         account = account + "LOGIN"
    //     }
        
    //     let result = await this.client.callApi("ptl/Login", {
    //         account: account,
    //         password: "",
    //     });

    //     if(result.isSucc) {
    //         cc.log("call success");
    //     }
    //     else {
    //         cc.log("call failed");
            
    //         cc.log(`call error:${result.err.toString()}`);
    //         cc.log(`call error:${result.err.code}`);
    //         cc.log(`call error:${result.err.type}`);
    //     }
    // }
}
