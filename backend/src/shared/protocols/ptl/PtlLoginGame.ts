import { DBPlayerInfo } from "../../db_structure/Player";
import { PlayerInfo, PlayerMap } from "../base";

export interface ReqLoginGame {
    pid: string,
    token: string,
    cookie: string,
}

export interface ResLoginGame {
    pdata : PlayerInfo;
    map: PlayerMap;
}


export const conf = {
    anonymous: true,
}