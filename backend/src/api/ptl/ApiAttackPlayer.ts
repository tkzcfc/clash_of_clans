import { ApiCall } from "tsrpc";
import { ReqAttackPlayer, ResAttackPlayer } from "../../shared/protocols/ptl/PtlAttackPlayer";
import { RpcErrCode } from "../../shared/RpcErr";

export async function ApiAttackPlayer(call: ApiCall<ReqAttackPlayer, ResAttackPlayer>) {
    let player = GRpcService.playerMng.get(call.req.pid);
    if(!player) {
        call.error(STR("玩家不存在"), {
            code: RpcErrCode.NOT_PLAYER
        })
        return;
    }

    call.succ({
        pdata: player.toPlayerSimpleInfo(),
        map: player.map.toPlayerSimpleMap(),
    });
}