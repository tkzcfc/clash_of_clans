import { DBPlayerInfo } from "../../db_structure/Player";

export interface ReqLoginGame {
    pid: string,
    token: string,
    cookie: string,
}

export interface ResLoginGame {
    pdata : DBPlayerInfo;
}


export const conf = {
    anonymous: true,
}