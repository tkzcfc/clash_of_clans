import { DBPlayerInfo } from "../../../coc/const/dbConfig";

export interface ReqLoginGame {
    pid: string,
    token: string,
    voucher: string,
}

export interface ResLoginGame {
    pdata : DBPlayerInfo;
    voucher: string,
}
