import { ApiCall } from "tsrpc";
import { ReqBuyAndPlaceToMap, ResBuyAndPlaceToMap } from "../../shared/protocols/ptl/PtlBuyAndPlaceToMap";

export async function ApiBuyAndPlaceToMap(call: ApiCall<ReqBuyAndPlaceToMap, ResBuyAndPlaceToMap>) {
    if(!call.conn.currentPlayer) {
        return;
    }

    call.succ({
        data : call.conn.currentPlayer.map.addUnit(call.req.id, call.req.x, call.req.y)
    })
}