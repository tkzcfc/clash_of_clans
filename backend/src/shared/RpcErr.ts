
export enum RpcErrCode {
    OK,
    // 账号不存在
    NOT_ACCOUNT,
    // 密码错误
    BAD_PASSWORD,
    // 账号已存在
    ACCOUNT_EXISTS,
    // 密码不合法
    Illegal_Password,
    // 玩家不存在
    NOT_PLAYER,
    // token错误
    BAD_TOKEN,
    // 此玩家已在游戏中
    Player_In_The_Game,
    // 凭证过期
    BAD_VOUCHER,
}
