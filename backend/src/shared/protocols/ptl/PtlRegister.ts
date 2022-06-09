
export interface ReqRegister {
    account: string,
    password: string,
    platform: number,
    deviceid: string,
}

export interface ResRegister {
    err: number,
}
