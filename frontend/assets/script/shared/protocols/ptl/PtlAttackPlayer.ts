import { PlayerSimpleInfo, PlayerSimpleMap } from "../base";


export interface ReqAttackPlayer {
    pid: string,
}

export interface ResAttackPlayer{
    pdata: PlayerSimpleInfo,
    map: PlayerSimpleMap,
}
