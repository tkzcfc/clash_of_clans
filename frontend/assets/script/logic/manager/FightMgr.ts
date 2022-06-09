/*
 * Created: 2022-05-04 16:36:16
 * Author : fc
 * Description: 战斗管理
 */

import { MapData } from "../data/MapData";
import { BaseMgr } from "./BaseMgr";


export class FightMgr extends BaseMgr
{
    constructor() {
        super();
        this.clear();
    }

    /**
     * 是否有对战信息
     */
    public hasFightInfo: boolean;

    /**
     * 对战地图信息
     */
    public mapData: MapData;

    /**
     * 设置PVP的对手信息
     */
    setPvPPlayerInfo(data: any) {
        this.hasFightInfo = true;

        let unimportant = data.unimportant;
        if(unimportant == "") {
            let unimportantData = {
                map: {
                    items: [
                        {
                            id: 10015,
                            lv: 1,
                            x: 18,
                            y: 18,
                        },
                        // {
                        //     id: 10015,
                        //     lv: 1,
                        //     x: 11,
                        //     y: 12,
                        // },
                    ]
                }
            }
            this.mapData = new MapData(unimportantData.map);
        }
        else {
            let unimportantData  = JSON.parse(unimportant);
            this.mapData = new MapData(unimportantData.map);
        }
    }

    clear() {
        this.hasFightInfo = false;
    }
}
