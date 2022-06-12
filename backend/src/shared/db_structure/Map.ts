export interface DBUnitData {
    uuid: number,
    id: number,
    x: number,
    y: number,
    lv: number,
    type: number,
}

export interface DBMapData {
    uuid: string,
    units: DBUnitData[];
}

