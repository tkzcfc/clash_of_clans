export interface DBUnitData {
    uuid: string,
    id: number,
    x: number,
    y: number,
    lv: number,
}

export interface DBMapData {
    uuid: string,
    units: DBUnitData[];
}

