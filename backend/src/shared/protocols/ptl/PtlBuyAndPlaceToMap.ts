import { PlayerMapUnit } from "../base";

export interface ReqBuyAndPlaceToMap {
    // itemid
    id: number,
    x: number,
    y: number,
}

export interface ResBuyAndPlaceToMap{
    data: PlayerMapUnit
}
