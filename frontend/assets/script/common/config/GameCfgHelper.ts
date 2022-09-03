import { ItemType, LogicTileType, UnitType } from "../../coc/const/enums";
import { GameUtils } from "../../coc/misc/GameUtils";
import { BuildingItem } from "../../imports/config/Cfg_Building";
import { ItemsItem } from "../../imports/config/Cfg_Items";
import { GameCfgMgr } from "../../manager/GameCfgMgr";
import { mgr } from "../../manager/mgr";

class RealRange {
    minx: number;
    maxx: number;
    miny: number;
    maxy: number;
    constructor(x1, x2, y1, y2) {
        this.minx = x1;
        this.maxx = x2;
        this.miny = y1;
        this.maxy = y2;
    }
}

export class GameCfgHelper {

    static getItemImage(cfgId: number):string {
        const cfg = mgr.getMgr(GameCfgMgr).getData("Items", cfgId);
        return cfg.Resource;
    }

    static getUnitImage(cfgId: number, lv: number): string {
        const cfg = mgr.getMgr(GameCfgMgr).getData("Unit", cfgId);

        if(cfg.Type == UnitType.Buildings) {
            if(cfg.Id == 10004)
                return `building/${cfg.Resource}_lvl${lv}_00_hd`;
            else
                return `building/${cfg.Resource}_lvl${lv}_hd`;
        }
        else if(cfg.Type == UnitType.Role) {
        }
        
        console.assert(false);
        return "";
    }
}

