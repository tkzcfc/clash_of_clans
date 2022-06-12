import { RpcErrCode } from "../../shared/RpcErr";
import { RpcService } from "../service/tsrpc/RpcService";

// 登录鉴权
export function enableAuthentication(service: RpcService) {
    service.rpc.flows.preApiCallFlow.push(call => {
        let conf = call.service.conf;

        // 允许匿名登录的API
        if(conf && conf.anonymous) {
            return call;
        }

        // 当前连接未登录
        if(!call.conn.currentPlayer) {
            call.error("You need login before do this", {
                code: RpcErrCode.NEED_LOGIN
            })
            return undefined;
        }

        return call;
    })

    service.rpc.flows.postDisconnectFlow.push(v => {
        if(v.conn.currentPlayer) {
            v.conn.currentPlayer.logout(RpcErrCode.Offline_DISCONNECTED);
            v.conn.currentPlayer = undefined;
        }

        return v;
    });
}
