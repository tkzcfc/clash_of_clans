
import { ServiceManager } from "./coc/service/ServiceManager";
import { Const } from "./coc/const/Const";
import { EventEmitter } from "./coc/common/EventEmitter"
import { RpcService } from "./coc/service/tsrpc/RpcService";
import { Logger } from "tsrpc";
import { SysEvent } from "./coc/common/SysEvent";


// export {};

declare global {
    var GServiceManager: ServiceManager;
    var GConst: Const;
    var GLog: Logger;
    var GRpcService: RpcService;

    var GSysEventEmitter : EventEmitter<SysEvent>;
    var GGmEventEmitter : EventEmitter<string>;

    function STR(str: string): string {
        return str;
    }
}
