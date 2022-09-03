/*
 * Created: 2022-09-01 15:55:03
 * Author : fc
 * Description: 
 */

import { UnitItem } from "../../imports/config/Cfg_Unit";
import { GameCfgMgr } from "../../manager/GameCfgMgr";
import { mgr } from "../../manager/mgr";
import { LogicTileType, UnitType } from "../const/enums";
import { GameDefine } from "../const/GameDefine";
import { GameContext } from "../misc/GameContext";
import { GameUtils } from "../misc/GameUtils";


const {ccclass, property} = cc._decorator;

@ccclass()
export class GameUnitBase extends cc.Component {
    @property({type: cc.Enum(UnitType)})
    type: UnitType = UnitType.None;

    x: number = 0;
    y: number = 0;
    flags: number[] = [];
    
    private cfg: UnitItem;
    

    /////////////////// 自动计算的属性 ///////////////////
    minx: number = 0;
    miny: number = 0;
    maxx: number = 0;
    maxy: number = 0;


    public get xCount() : number {
        return this.cfg.XCount;
    }

    public get yCount() : number {
        return this.cfg.YCount;
    }

    public get config(): UnitItem {
        return this.cfg;
    }
    

    initWithConfigId(cfgId: number, x: number, y: number) {
        const cfg = mgr.getMgr(GameCfgMgr).getData("Unit", cfgId);

        this.cfg = cfg;
        this.x = x;
        this.y = y;
        this.flags.length = this.xCount * this.yCount;
        for(let y = 0; y < this.yCount; ++y){
            for(let x = 0; x < this.xCount; ++x){
                this.flags[x + y * this.xCount] = cfg.Flags[y][x];
            }
        }

        // this.updateFlags();

        this.minx = cfg.RealRange[0];
        this.maxx = cfg.RealRange[1];
        this.miny = cfg.RealRange[2];
        this.maxy = cfg.RealRange[3];
    }

    updateFlags() {
        if(this.type == UnitType.Buildings) {
            
            // [3, 3, 3, 3, 3],
            // [3, 1, 1, 1, 3],
            // [1, 1, 1, 1, 3],
            // [3, 1, 1, 1, 3],
            // [3, 0, 3, 3, 3],
            // 以下方法的计算结果 [minx, maxx]  [miny, maxy]
            //        [0, 3]        [1, 4]
            //  这种情况下minx = 1排序效果会更好一些,所以此处不自动计算，直接使用配置

            this.minx = this.xCount - 1;
            this.maxx = 0;
            this.miny = this.yCount - 1;
            this.maxy = 0;

            // 建筑物计算真实建筑范围
            for(let y = 0; y < this.yCount; ++y) {
                for(let x = 0; x < this.xCount; ++x) {
                    const flag = this.flags[x + y * this.yCount];
                    if(!GameUtils.bitHas(flag, LogicTileType.Walkable)) {
                        this.maxx = Math.max(x, this.maxx);
                        this.minx = Math.min(x, this.minx);
                        this.maxy = Math.max(y, this.maxy);
                        this.miny = Math.min(y, this.miny);
                    }
                }
            }

            cc.log(`${this.cfg.Id}  x:[${this.minx}, ${this.maxx}]  y:[${this.miny}, ${this.maxy}]`);
        }
        else {
            this.minx = 0;
            this.miny = 0;
            this.maxx = this.xCount - 1;
            this.maxy = this.yCount - 1;
        }
    }

    getMinX(): number {
        return this.x + this.minx;
    }
    
    getMaxX(): number {
        return this.x + this.maxx;
    }
    
    getMinY(): number {
        return this.y + this.miny;
    }
    
    getMaxY(): number {
        return this.y + this.maxy;
    }

    
    /**
     * 获取当前占用格子大小
     */
     getTileSize(): cc.Vec2 {
        return new cc.Vec2(GameDefine.LOGIC_TILE_WIDTH * this.xCount, GameDefine.LOGIC_TILE_HEIGHT * this.yCount);
    }
    
    /**
     * 是否包含该坐标
     * @param logicPos 
     * @returns 
     */
     containLogicPos(logicPos: cc.Vec2): boolean {
         return this.containLogicPosEx(logicPos.x, logicPos.y);
    }

    
    /**
     * 是否包含该坐标
     * @param logicPos 
     * @returns 
     */
     containLogicPosEx(logicPosX: number, logicPosY: number): boolean {
        for(let y = 0; y < this.yCount; ++y) {
            for(let x = 0; x < this.xCount; ++x) {
                if(this.x + x == logicPosX && this.y + y == logicPosY) {
                    return true;
                }
            }
        }
        return false;
    }
}
