import { PlayerMapUnit } from "../base";

export interface ReqAddUnitToMap {
    // 物品id
    uuid: string,
    x: number,
    y: number,
}

export interface ResAddUnitToMap{
    data: PlayerMapUnit
}
