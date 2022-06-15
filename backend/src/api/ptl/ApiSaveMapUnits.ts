import { ApiCall } from "tsrpc";
import { ReqSaveMapUnits, ResSaveMapUnits } from "../../shared/protocols/ptl/PtlSaveMapUnits";
import { RpcErrCode } from "../../shared/RpcErr";

export async function ApiSaveMapUnits(call: ApiCall<ReqSaveMapUnits, ResSaveMapUnits>) {
    if(!call.conn.currentPlayer) {
        return;
    }

    const map = call.conn.currentPlayer.map;
    call.req.units.forEach(v=>{
        if(!map.getUnit(v.uuid)) {
            call.error(STR("存在未知unit"), {
                code: RpcErrCode.SAVE_MAP_HAS_BAD_UNIT,
            })
            return;
        }
    });

    // 删除逻辑
    map.dbData.units.forEach(v=>{
        let find = false;
        const units = call.req.units;
        for(let i = 0, j = units.length; i < j; ++i) {
            if(units[i].uuid == v.uuid) {
                find = true;
                break;
            }
        }

        // 删除原有的unit,将其放入背包
        if(!find) {

        }
    });

    // 位置更新
    call.req.units.forEach(v=>{
        let unit = map.getUnit(v.uuid);
        if(unit) {
            unit.x = v.x;
            unit.y = v.y;
        }
    });

    map.updateToDb();

    call.succ({});
}