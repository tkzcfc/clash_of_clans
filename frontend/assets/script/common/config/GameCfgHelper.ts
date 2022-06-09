import { ItemType } from "../../logic/common/enums";

export class GameCfgHelper {

    static getItemImage(cfg: any, lv?: number):string {
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

}

