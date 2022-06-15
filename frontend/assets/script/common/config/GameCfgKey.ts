
export interface BuildingItemType {
    Id: number, 
    Type: number, 
    MaxLv: number, 
    XCount: number, 
    YCount: number, 
    OffsetX: number, 
    OffsetY: number, 
    LogicX: number, 
    LogicY: number, 
    LogicOffsetX: number, 
    LogicOffsetY: number, 
    ScaleX: number, 
    ScaleY: number, 
    Offsets: number[]
}

export interface GameCfgType {
    Building: BuildingItemType
}

export namespace GameCfgKey {
    export const Building: string = "Building";
    export const Items: string = "Items";
    export const Role: string = "Role";
    export const Shop: string = "Shop";
}

