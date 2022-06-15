
export interface ReqGetPvpList {
    pageIndex: number,
    pageCount: number,
}

export interface PvpListItem {
    pid: string,
    name: string,
    lv: number,    
}

export interface ResGetPvpList{
    items: PvpListItem[];
}
