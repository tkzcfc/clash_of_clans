import { DBAccountInfo } from "../../../shared/db_structure/Account";
import { DBBagData } from "../../../shared/db_structure/Bag";
import { DBMapData } from "../../../shared/db_structure/Map";
import { DBPlayerInfo } from "../../../shared/db_structure/Player";

export interface dbConfig {
    data: {
        user: DBAccountInfo,
        player: DBPlayerInfo,
        map: DBMapData,
        bag: DBBagData,
    }
}


