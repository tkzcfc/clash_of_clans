import { ApiCall } from "tsrpc";
import { ReqGetPvpList, ResGetPvpList } from "../../shared/protocols/ptl/PtlGetPvpList";

export async function ApiGetPvpList(call: ApiCall<ReqGetPvpList, ResGetPvpList>) {
    let res: ResGetPvpList = {
        items: []
    };

    let players = GRpcService.playerMng.players;
    for(let i = call.req.pageIndex * call.req.pageCount, j = players.length; i < j; ++i) {
        const player = players[i];

        if(player === call.conn.currentPlayer) {
            continue;
        }

        res.items.push({
            name: player.dbData.name,
            pid: player.dbData.pid,
            lv: player.dbData.lv
        })

        if(res.items.length >= call.req.pageCount) {
            break;
        }
    }

    call.succ(res);
}