

// 背包类型
export enum BagType {
    // 建筑背包
    Build,
    // 货币背包
    Currency
}

export interface DBBuildBagItem {
    uuid: string,
    id: number,
    count: number,
}

export interface DBBuildBagData {
    items: DBBuildBagItem[],
}



export interface DBCurrencyBagItem {
    count: number,
}

export interface DBCurrencyBagData {
    items: DBCurrencyBagItem[],    
}



export interface DBBagData {
    build: DBBuildBagData,
    currency: DBCurrencyBagData,
}
