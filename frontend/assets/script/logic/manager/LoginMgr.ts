/*
 * Created: 2022-05-01 21:17:14
 * Author : fc
 * Description: 登录管理
 */

import { CoreEvent } from "../../core/common/event/CoreEvent";
import { core } from "../../core/InitCore";
import { Const } from "../common/Const";
import { PlayerData } from "../data/PlayerData";
import { MessageID } from "../msg/Message";
import { NetError } from "../msg/NetError";
import { MessageBox } from "../ui/common/MessageBox";
import { UIUtils } from "../ui/UIUtils";
import { BaseMgr } from "./BaseMgr";

export class LoginMgr extends BaseMgr
{
    // 当前重连次数
    _reconnectNum: number = 0;
    // 是否显示msgBox
    _showMsgBox: boolean = false;
    // 是否断线重连
    _isReconnect: boolean = true;

    constructor() {
        super();
        this.initSysEvent();
        this.initNetEvent();
    }
    
    private initSysEvent() {
            
        // 连接成功
        core.sysEventEmitter.on(CoreEvent.NET_ON_OPEN, (key, url)=>{
            this._showMsgBox = false;
            this._reconnectNum = 0;
            // 已经登录过了，此处直接使用token断线重连
            if(PlayerData.getInstance()) {
                PlayerData.getInstance().tokenReconnection();
            }
        }, this);
        
        // 关闭后自动重连
        core.sysEventEmitter.on(CoreEvent.NET_ON_CLOSE, (key, url)=>{
            if(this._showMsgBox || !this._isReconnect)
                return;

            if(this._reconnectNum > 5) {
                this._reconnectNum = 0;
                this._showMsgBox = true;
                console.log("服务器连接失败...");

                core.ui.current().pushUI(Const.UIs.MessageBox, null, (node: cc.Node)=>{
                    node.getComponent(MessageBox).showOne("服务器连接失败，请稍后再试", ()=>{
                        this._showMsgBox = false;
                        core.client.connect(key, url);
                    });
                }, 10);
            }
            else {
                setTimeout(()=>{
                    core.client.connect(key, url);
                }, this._reconnectNum * 100);
            }
            this._reconnectNum++;
        }, this);

        // 开始连接
        core.sysEventEmitter.on(CoreEvent.NET_ON_CONNECT_START, (key, url)=>{
            if(!core.ui.current().contain(Const.UIs.NetLoading)) {
                core.ui.current().pushUI(Const.UIs.NetLoading, null, null, 10);
            }
        }, this);
    }

    private initNetEvent() {
        // 登录结果返回
        core.netEventEmitter.on(MessageID.LOGIN_GAME_ACK, (msg: any) => {
            let errStr = "";
            if(msg.code == NetError.Token_Expiration) {
                errStr = "token已过期，请重新登录";
            }
            else if(msg.code == NetError.Player_In_The_Game) {
                errStr = "此玩家已在游戏中";                
            }

            if(errStr !== "") {
                this._isReconnect = false;
                UIUtils.showMsgBoxOne(errStr, ()=>{
                    cc.game.end();
                });
            }
        }, this);

        // 此账号在其他设备登录
        core.netEventEmitter.on(MessageID.LOGIN_IN_ELSEWHERE, (msg: any) => {
            this._isReconnect = false;
            UIUtils.showMsgBoxOne("账号在其他设备登录", ()=>{
                cc.game.end();
            });
        }, this);

        // 断线重连开始
        core.netEventEmitter.on(MessageID.REUNION_PUSH_BEGIN, (msg: any) => {
        }, this);

        // 断线重连结束
        core.netEventEmitter.on(MessageID.REUNION_PUSH_END, (msg: any) => {
        }, this);


        // 登录成功推送开始
        core.netEventEmitter.on(MessageID.LOGIN_SUC_PUSH_BEGIN, (msg: any) => {
            PlayerData.destroy();
            PlayerData.newInstance(msg);
        }, this);

        // 登录成功推送结束
        core.netEventEmitter.on(MessageID.LOGIN_SUC_PUSH_END, (msg: any) => {
            PlayerData.getInstance().token = msg.token;
            core.viewManager.runView(Const.Views.GameView);
        }, this);
    }

    onDestroy() {
        core.sysEventEmitter.removeAllListenerByContext(this);
        super.onDestroy();
    }
}
