import { ItemType, LogicTileType } from "../../coc/const/enums";
import { GameUtils } from "../../coc/misc/GameUtils";
import { BuildingItem } from "../../imports/config/Cfg_Building";
import { ItemsItem } from "../../imports/config/Cfg_Items";

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

    static getItemImage(cfg: ItemsItem, lv?: number):string {
        switch(cfg.Type) {
            case ItemType.buildings:{
                if(lv === undefined)
                    lv = 1;

                if(cfg.Id == 10004)
                    return `building/${cfg.Resource}_lvl${lv}_00_hd`;
                else
                    return `building/${cfg.Resource}_lvl${lv}_hd`;
            }
            default:
                console.assert(false);
        }
    }


    /**
     * 获取建筑实际占地范围
     * @param cfg 
     */
    static getBuildRealRange(cfg: BuildingItem): RealRange {
        if(this.realRangeCacheMap.has(cfg.Id)) {
            return this.realRangeCacheMap.get(cfg.Id);
        }
        
        const flags = cfg.Flags;
        const xCount = flags[0].length;
        const yCount = flags.length;

        let minX = xCount;
        let maxX = 0;
        let minY = yCount;
        let maxY = 0;
    
        for(let y = 0; y < yCount; ++y) {
            for(let x = 0; x < xCount; ++x) {
                const flag = flags[y][x];
                if(!GameUtils.bitHas(flag, LogicTileType.Walkable)) {
                    maxX = Math.max(x, maxX);
                    minX = Math.min(x, minX);
                    maxY = Math.max(y, maxY);
                    minY = Math.min(y, minY);
                }
            }
        }

        let range = new RealRange(minX, maxX, minY, maxY);
        this.realRangeCacheMap.set(cfg.Id, range);
        return range;
    }
    static realRangeCacheMap = new Map<number, RealRange>();
}

