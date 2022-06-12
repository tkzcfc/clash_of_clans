import { ApiCall } from "tsrpc";
import { ReqLoginGame, ResLoginGame } from "../../shared/protocols/ptl/PtlLoginGame";
import { RpcErrCode } from "../../shared/RpcErr";

export async function ApiLoginGame(call: ApiCall<ReqLoginGame, ResLoginGame>) {
    let player = GRpcService.playerMng.get(call.req.pid);
    if(!player) {
        call.error(STR("玩家不存在"), {
            code: RpcErrCode.NOT_PLAYER
        })
        return;
    }

    if(call.req.token != player.token) {
        call.error(STR("token错误"), {
            code: RpcErrCode.BAD_TOKEN
        })
        return;        
    }

    let isReunion = false;
    // 断线重连
    if(call.req.cookie != "") {
        if(player.cookie != call.req.cookie) {
            call.error(STR("凭证过期"), {
                code: RpcErrCode.BAD_VOUCHER
            })
            return;
        }
        isReunion = true;
    }

    call.succ({
        pdata: player.dbData,
    }); 

    player.login(call.conn, isReunion);
}