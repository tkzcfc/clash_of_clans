export interface PlayerSimpleInfo {
    pid: string,
    name: string,
    lv: number,
    exp: number,
}


export interface PlayerInfo extends PlayerSimpleInfo {
    // 金币
    coins: number,
    // 钻石
    diamonds: number,
}



export interface PlayerMapUnit {
    uuid: string,
    id: number,
    x: number,
    y: number,
    lv: number,
}
export interface PlayerSimpleMap {
    units: PlayerMapUnit[]
}

export interface PlayerMap {
    units: PlayerMapUnit[]
}




