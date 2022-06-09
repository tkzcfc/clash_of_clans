
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

export interface UnitData {
    uuid: number,
    id: number,
    x: number,
    y: number,
    lv: number,
    type: number,
}

export interface MapData {
    units: UnitData[];
}


export interface BagBuildItem {
    uuid: string,
    id: number,
    count: number,
}

export interface BagData {
    build: BagBuildItem[],
}


export interface DBPlayerInfo {
    // pid
    pid: string,
    // 昵称
    name: string,
    // 登记
    lv: number,
    // 经验
    exp: number,
    // 金币
    coins: number,
    // 钻石
    diamonds: number,
    // 地图数据
    map: MapData;
    // 背包
    bag: BagData;
}

export interface dbConfig {
    data: {
        user: DBAccountInfo,
        player: DBPlayerInfo,
    }
}


