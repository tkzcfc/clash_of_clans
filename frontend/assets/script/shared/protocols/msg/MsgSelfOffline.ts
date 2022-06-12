import { RpcErrCode } from "../../RpcErr";

export interface MsgSelfOffline {
    why: RpcErrCode; 
}