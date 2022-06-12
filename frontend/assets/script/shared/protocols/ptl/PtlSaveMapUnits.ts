
export interface SaveMapUnit {
    uuid: number,
    x: number,
    y: number
}

export interface ReqSaveMapUnits {
    units: SaveMapUnit[];
}

export interface ResSaveMapUnits {
}
