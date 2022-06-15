/*
 * Created: 2022-05-04 16:36:16
 * Author : fc
 * Description: 战斗管理
 */

import { PlayerSimpleInfo, PlayerSimpleMap } from "../shared/protocols/base";
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
    public mapData: PlayerSimpleMap;
    
    /**
     * 对手信息
     */
     public playerData: PlayerSimpleInfo;

    /**
     * 设置PVP的对手信息
     */
    setPvPInfo(player: PlayerSimpleInfo, map: PlayerSimpleMap) {
        this.hasFightInfo = true;
        this.playerData = player;
        this.mapData = map;
    }

    clear() {
        this.hasFightInfo = false;
        this.playerData = undefined;
        this.mapData = undefined;
    }
}
