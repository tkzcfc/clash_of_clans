import { DBMapData } from "../../shared/db_structure/Map";
import { DBService } from "../service/db/DBService";



export class GameMap {
    dbData: DBMapData;

    constructor(dbData: DBMapData) {
        this.dbData = dbData;
    }

    
    /**
     * 更新到数据库
     */
     updateToDb() {
        GServiceManager.getService(DBService).autoAddData("data", "map", this.dbData);
    }
}
