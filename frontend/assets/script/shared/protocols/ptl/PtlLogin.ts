
export interface ReqLogin {
    account: string,
    password: string,
}

export interface ResLogin {
    token: string,
    players: string[],
}

export const conf = {
    anonymous: true,
}