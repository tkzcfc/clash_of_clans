
export enum OfflineCode {
    // 正常下线
    NONE,
    // 在其他设备上顶替登录
    ALTERNATE_LOGIN,
    // token改变
    CHANGE_TOKEN,
    // 其他原因
    OTHER
}

export interface MsgSelfOffline {
    why: OfflineCode; 
}