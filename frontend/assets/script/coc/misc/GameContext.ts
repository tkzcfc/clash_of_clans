/*
 * Created: 2022-03-07 17:38:50
 * Author : fc
 * Description: 游戏上下文
 */

import { TileAlgorithm } from "../algorithm/TileAlgorithm";
import { EventEmitter } from "../../core/common/event/EventEmitter";
import { GameEvent } from "./GameEvent";
import { DrawTileMode, LogicTileType } from "../const/enums";
import { GameUtils } from "./GameUtils";
import { GameLayer } from "../GameLayer";
import { GameDefine } from "../const/GameDefine";
import { GameUnit } from "../unit/GameUnit";
import { GameUnitBase } from "../unit/GameUnitBase";


export class GameContext {
    static instance: GameContext = null;

    public static getInstance(): GameContext {
        if (!this.instance) {
            this.instance = new GameContext();
        }
        return this.instance;
    }

    public static destroy(): void {
        this.instance = null;
    }

    //////////////////////////////////////////////////////////////////////////////////////
    // 逻辑格子算法
    public logicTileAlgorithm: TileAlgorithm;

    // 逻辑格子类型
    public logicTileTypeArr: LogicTileType[] = [];

    // 自动放置可选位置
    public autoPlacePosArr: cc.Vec2[] = [];


    // 游戏内部事件派发器
    eventEmitter : EventEmitter<GameEvent>;

    gameLayer: GameLayer = null;

    private constructor() {
        this.resetAlgorithm();
        this.eventEmitter = new EventEmitter<GameEvent>();
    }

    resetAlgorithm() {
        const xcount = GameDefine.LOGIC_X_COUNT;
        const ycount = GameDefine.LOGIC_Y_COUNT;
        const width  = GameDefine.LOGIC_TILE_WIDTH;
        const height = GameDefine.LOGIC_TILE_HEIGHT;
        
        // 格子算法初始化
        this.logicTileAlgorithm = new TileAlgorithm(width, height, xcount, ycount);
        this.logicTileTypeArr.length = xcount * ycount;

        // 自动摆放位置数组（按照中心点到边缘排序）
        this.autoPlacePosArr.length = GameDefine.X_COUNT * GameDefine.Y_COUNT;
        for(let x = 0; x < GameDefine.X_COUNT; ++x) {
            for(let y = 0; y < GameDefine.Y_COUNT; ++y) {
                this.autoPlacePosArr[y * xcount + x] = new cc.Vec2(x * GameDefine.LOGIC_SCALE, y * GameDefine.LOGIC_SCALE);
            }
        }
        // 排序
        let center = new cc.Vec2((xcount - 1) * 0.5, (ycount - 1) * 0.5);
        let distanceA = new cc.Vec2();
        let distanceB = new cc.Vec2();
        this.autoPlacePosArr.sort((a: cc.Vec2, b: cc.Vec2)=>{
            distanceA.x = center.x - a.x;
            distanceA.y = center.y - a.y;
            distanceB.x = center.x - b.x;
            distanceB.y = center.y - b.y;
            return distanceA.lengthSqr() - distanceB.lengthSqr();
        });

        this.clearTileData();
    }

    clearTileData() {
        const len = this.logicTileTypeArr.length;
        for(let i = 0; i < len; ++i) {
            this.logicTileTypeArr[i] = LogicTileType.None;
        }
    }

    addUnit(unit: GameUnit) {
        this.modifyUnit(unit, GameUtils.bitSet);
    }

    delUnit(unit: GameUnit) {
        this.modifyUnit(unit, GameUtils.bitDel);
    }

    modifyUnit(unit: GameUnit, operation: Function) {
        for(let x = 0; x < unit.xCount; ++x) {
            for(let y = 0; y < unit.yCount; ++y) {
                let index = x + y * unit.yCount;
                let realIndex = x + unit.x + (y + unit.y) * GameDefine.LOGIC_X_COUNT;
                this.logicTileTypeArr[realIndex] = operation(this.logicTileTypeArr[realIndex], unit.flags[index]);
            }
        }

        this.eventEmitter.emit(GameEvent.ON_NTF_UPDATE_TILE_DATA);
    }

    canPlace(unit: GameUnitBase) {
        const px = unit.x;
        const py = unit.y;
        const xCount = unit.xCount;
        const yCount = unit.yCount;
        const unitType = LogicTileType.Buildings;

        if(px < 0 || py < 0 || px > GameDefine.LOGIC_X_COUNT - xCount || py > GameDefine.LOGIC_Y_COUNT - yCount) {
            return false;
        }

        let index = 0;
        for(let x = 0; x < xCount; ++x) {
            for(let y = 0; y < yCount; ++y) {
                index = x + px + (y + py) * GameDefine.LOGIC_X_COUNT;
                // cc.log(`${x + y * GameDefine.LOGIC_X_COUNT}  ${this.logicTileTypeArr[index]}   ${GameUtils.bitGet(this.logicTileTypeArr[index], unitType)}   ${unitType}`)
                if(GameUtils.bitGet(this.logicTileTypeArr[index], unitType) == unitType) {
                    return false;
                }
            }
        }

        return true;
    }

    getPlacePos(xCount: number, yCount: number) {
        let outPos = new cc.Vec2(-1, -1);

        let unit : GameUnitBase = new GameUnitBase();
        unit.x = 0;
        unit.x = 0;
        unit.xCount = xCount;
        unit.yCount = yCount;

        for(let i = 0, j = this.autoPlacePosArr.length; i < j; ++i) {
            const tmp = this.autoPlacePosArr[i];
            unit.x = tmp.x;
            unit.y = tmp.y;

            if(this.canPlace(unit)) {
                outPos.set(tmp);
                break;
            }            
        }
        return outPos;
    }

    drawMapTile(g: cc.Graphics, drawTileMode: DrawTileMode) {
        g.clear();

        switch(drawTileMode)
        {
            case DrawTileMode.None: {
                break;
            }
            case DrawTileMode.ShowLogicTile: {
                let algorithm = this.logicTileAlgorithm;
                let LOGIC_SCALE = GameDefine.LOGIC_SCALE

                let fillColor = g.fillColor;
                let strokeColor = g.strokeColor;

                algorithm.setDrawTileOffset(GameDefine.X_COUNT * algorithm.TILE_WIDTH_HALF * LOGIC_SCALE, 0.0);
                algorithm.drawTile(g, 0, 0, GameDefine.X_COUNT * LOGIC_SCALE, GameDefine.Y_COUNT * LOGIC_SCALE, (logicx: number, logicy: number, renderPos: cc.Vec2) =>{
                    let index = logicx + logicy * GameDefine.Y_COUNT * LOGIC_SCALE;
                    let type = this.logicTileTypeArr[index];

                    if(type & LogicTileType.Walkable) {
                        g.fillColor = cc.Color.GREEN.clone();
                        g.strokeColor = cc.Color.GREEN.clone();
                        g.fillColor.a = 100;                        
                    }
                    else if(type & LogicTileType.Role) {
                        g.fillColor = cc.Color.BLUE.clone();
                        g.strokeColor = cc.Color.BLUE.clone();
                        g.fillColor.a = 100;
                    }
                    else if(type & LogicTileType.Buildings) {
                        g.fillColor = cc.Color.RED.clone();
                        g.strokeColor = cc.Color.RED.clone();
                        g.fillColor.a = 100;
                    }
                    else{
                        g.fillColor = fillColor;
                        g.strokeColor = strokeColor;                        
                    }
                });

                g.fillColor = fillColor;
                g.strokeColor = strokeColor;
                break;
            }
        };
    }

    canWalk(x: number, y:number): boolean {
        const index = x + y * GameDefine.LOGIC_X_COUNT;
        const value = this.logicTileTypeArr[index];

        const walkFlags = LogicTileType.Role | LogicTileType.Walkable;
        const flag      = value & walkFlags;

        return value == LogicTileType.None || (flag != 0);
    }
}
