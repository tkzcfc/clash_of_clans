/*
 * Created: 2022-09-01 15:55:03
 * Author : fc
 * Description: 
 */

import { LogicTileType, UnitType } from "../const/enums";
import { GameDefine } from "../const/GameDefine";
import { GameContext } from "../misc/GameContext";
import { GameUtils } from "../misc/GameUtils";


const {ccclass, property} = cc._decorator;

@ccclass()
export class GameUnitBase extends cc.Component {
    x: number = 0;
    y: number = 0;
    xCount: number = 1;
    yCount: number = 1;
    flags: number[] = [];
    
    @property({type: cc.Enum(UnitType)})
    type: UnitType = UnitType.None;

    /////////////////// 自动计算的属性 ///////////////////
    minx: number = 0;
    miny: number = 0;
    maxx: number = 0;
    maxy: number = 0;

    protected onLoad(): void {
        this.updateFlags();
    }

    updateFlags() {
        if(this.type == UnitType.Buildings) {
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
