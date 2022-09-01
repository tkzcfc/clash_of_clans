import { DataFactory } from "../models/DataFactory";
import { GameMap } from "../models/GameMap";
import { DBService } from "../service/db/DBService";
import { RandomUtils } from "../utils/RandomUtils";
import { IManager } from "./IManager";


/**
 * 地图管理
 */
export class MapManager implements IManager {
    maps: GameMap[] = [];

    constructor() {
    }
    
    onStart(): void {
        GServiceManager.getService(DBService).onRead("data", "map", data=>{
            let map = new GameMap(data);
            this.maps.push(map);
        }, this);
    }

    get(uuid: string) {
        let current: GameMap;
        for(let i = 0, j = this.maps.length; i < j; ++i) {
            current = this.maps[i];
            if(current.dbData.uuid == uuid) {
                return current;
            }
        }
    }

    newMap() {
        while(true) {
            let uuid = RandomUtils.uuid();
            if(!this.get(uuid)) {
                return this.newMapEx(uuid);
            }
        }        
    }

    newMapEx(uuid: string) {
        let map = new GameMap(DataFactory.newMapData(uuid));
        this.maps.push(map);        
        map.updateToDb();
        return map;
    }
}
