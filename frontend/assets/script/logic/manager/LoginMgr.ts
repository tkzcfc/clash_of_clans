/*
 * Created: 2022-05-01 21:17:14
 * Author : fc
 * Description: 登录管理
 */

import { core } from "../../core/InitCore";
import { Const } from "../common/Const";
import { BaseMgr } from "./BaseMgr";
import { mgr } from "./mgr";
import { RpcMgr } from "./RpcMgr";

export class LoginMgr extends BaseMgr
{
    pid = "";
    token = "";
    cookie = "";

    constructor() {
        super();
        this.initNetEvent();
    }

    async loginGame() {
        if(this.pid == "") {
            return;
        }

        let ret = await mgr.getMgr(RpcMgr).callApi("ptl/LoginGame", {
            pid: this.pid,
            token: this.token,
            cookie: this.cookie
        })

        if(ret.isSucc) {
            // ret.res.pdata
        }
    }

    private initNetEvent() {
        let client = mgr.getMgr(RpcMgr).client;

        // 进入游戏完成消息
        client.listenMsg("msg/LoginGameFinish", (msg => {
            core.viewManager.runView(Const.Views.GameView);
        }));
        // 被服务器踢出消息
        client.listenMsg("msg/SelfOffline", (msg => {
            mgr.getMgr(RpcMgr).showErrCode(msg.why);
        }));
    }
}
