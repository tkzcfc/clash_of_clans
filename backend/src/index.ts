/*
* @Author: fc
* @Date:   2022-03-17 13:04:39
* @remark: 
*/

import { EventEmitter } from "./coc/common/EventEmitter";
import { Const } from "./coc/const/Const";
import { DBService } from "./coc/service/db/DBService";
import { GMService } from "./coc/service/gm/GMService";
import { ServiceManager } from "./coc/service/ServiceManager";
import { RpcService } from "./coc/service/tsrpc/RpcService";
import { Logger, TerminalColorLogger } from "tsrpc";
import { SysEvent } from "./coc/common/SysEvent";

declare global {
    var GServiceManager: ServiceManager;
    var GConst: Const;
    var GLog: Logger;
    var GRpcService: RpcService;

    var GSysEventEmitter : EventEmitter<SysEvent>;
    var GGmEventEmitter : EventEmitter<string>;
    
    function STR(str: string): string;
}


function initGlobals() {
    global.STR = function(str: string): string {
        return str;
    }

    global.GLog = new TerminalColorLogger({
        pid: "sys"
    });
    global.GServiceManager = new ServiceManager();
    global.GConst = new Const();

    global.GSysEventEmitter = new EventEmitter<SysEvent>();
    global.GGmEventEmitter = new EventEmitter<string>();
}

async function main() 
{
    initGlobals();

    var manager = GServiceManager;
    manager.addService(GMService);
    manager.addService(DBService);
    manager.addService(RpcService);

    global.GRpcService = manager.getService(RpcService);

    if(!await manager.start())
        GLog.error("服务启动失败")
}

main();


