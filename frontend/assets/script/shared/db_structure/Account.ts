
export interface DBAccountInfo {
    // 账号
    account: string,
    // 密码
    password: string,
    // 注册平台
    platform: number,
    // 注册处设备码
    deviceid: string,
    // 拥有玩家信息
    players: string[];
    // 注册时间
    registerDate: Date;
    // 注册IP
    registerIp: string;
}