import { IService } from "../IService";

import * as path from "path";
import { TerminalColorLogger, WsServer } from "tsrpc";
import { serviceProto } from "../../../shared/protocols/serviceProto";
import { AccountManager } from "../../logic/AccountManager";
import { PlayerManager } from "../../logic/PlayerManager";

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

    public accountMng?: AccountManager;
    public playerMng?: PlayerManager;

    async onStart(): Promise<void> {
        this.accountMng = new AccountManager();
        this.playerMng = new PlayerManager();

        await this.rpc.autoImplementApi(path.resolve(__dirname, '../../../api'));
        await this.rpc.start();

        

        this.rpc.flows.postDisconnectFlow.push(v=>{
            
            return v;
        });

    }

    async onStop(): Promise<void> {
        this.rpc.connections.forEach((conn)=>{
            conn.close();
        });
        await this.rpc.stop();   
    }
}
