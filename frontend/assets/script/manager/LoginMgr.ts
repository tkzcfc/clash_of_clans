/*
 * Created: 2022-05-01 21:17:14
 * Author : fc
 * Description: 登录管理
 */

import { core } from "../core/InitCore";
import { BaseMgr } from "./BaseMgr";
import { mgr } from "./mgr";
import { RpcMgr } from "./RpcMgr";
import { PlayerDataMgr } from "./PlayerDataMgr";
import GameView from "../views/GameView";

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
            mgr.getMgr(PlayerDataMgr).set(ret.res.pdata, ret.res.map);
        }
    }

    private initNetEvent() {
        let client = mgr.getMgr(RpcMgr).client;

        // 进入游戏完成消息
        client.listenMsg("msg/LoginGameFinish", (msg => {
            this.cookie = msg.cookie;
            core.viewManager.runEmptyView(GameView);
        }));
    }
}
