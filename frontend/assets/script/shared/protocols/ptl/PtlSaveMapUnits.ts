
export interface SaveMapUnit {
    uuid: string,
    x: number,
    y: number
}

export interface ReqSaveMapUnits {
    units: SaveMapUnit[];
}

export interface ResSaveMapUnits {
}
