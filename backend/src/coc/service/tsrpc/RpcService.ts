import { IService } from "../IService";

import * as path from "path";
import { TerminalColorLogger, WsServer } from "tsrpc";
import { serviceProto } from "../../../shared/protocols/serviceProto";
import { AccountManager } from "../../manager/AccountManager";
import { PlayerManager } from "../../manager/PlayerManager";
import { enableAuthentication } from "../../models/EnableAuthentication";
import { connectionInterception } from "../../models/ConnectionInterception";
import { MapManager } from "../../manager/MapManager";

export class RpcService extends IService {
    readonly rpc = new WsServer(serviceProto, {
        // 端口监听
        port: GConst.ServerPort,
        // 传输是否启用JSON模式
        json: false,
        // logger
        logger: new TerminalColorLogger({
            pid: "rpc",
        })
    });

    readonly accountMng = new AccountManager();
    readonly playerMng = new PlayerManager();
    readonly mapMng = new MapManager();

    async onStart(): Promise<void> {
        this.accountMng.onStart();
        this.playerMng.onStart();
        this.mapMng.onStart();

        await this.rpc.autoImplementApi(path.resolve(__dirname, '../../../api'));
        await this.rpc.start();

        // 登录鉴权
        enableAuthentication(this);
        // 连接拦截
        connectionInterception(this);
    }

    async onStop(): Promise<void> {
        this.rpc.connections.forEach((conn)=>{
            conn.close();
        });
        await this.rpc.stop();   
    }
}
