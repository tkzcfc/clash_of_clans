import { DBMapData } from "../../shared/db_structure/Map";
import { PlayerMap, PlayerSimpleMap } from "../../shared/protocols/base";
import { DBService } from "../service/db/DBService";
import { CryptoUtils } from "../utils/CryptoUtils";



export class GameMap {
    dbData: DBMapData;

    constructor(dbData: DBMapData) {
        this.dbData = dbData;
    }

    getUnit(uuid: string) {
        const units = this.dbData.units;
        for(let i = 0, j = units.length; i < j; ++i) {
            if(units[i].uuid == uuid) {
                return units[i];
            }
        }
    }

    /**
     * 添加新的建筑
     * @param id 
     * @param x 
     * @param y 
     */
    addUnit(id: number, x: number, y: number) {
        let uuid = CryptoUtils.generateUUID();
        while(this.getUnit(uuid)) {
            uuid = CryptoUtils.generateUUID();            
        }

        this.dbData.units.push({
            uuid: uuid,
            id: id,
            x: x,
            y: y,
            lv: 1,
        });

        this.updateToDb();

        return this.dbData.units.last();
    }

    toPlayerMap(): PlayerMap {
        return {
            units: this.dbData.units
        }
    }

    toPlayerSimpleMap(): PlayerSimpleMap {
        return {
            units: this.dbData.units
        }
    }
    
    /**
     * 更新到数据库
     */
     updateToDb() {
        GServiceManager.getService(DBService).autoAddData("data", "map", this.dbData);
    }
}
