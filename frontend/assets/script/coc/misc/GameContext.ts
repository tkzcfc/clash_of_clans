/*
 * Created: 2022-03-07 17:38:50
 * Author : fc
 * Description: 游戏上下文
 */

import { TileAlgorithm } from "../algorithm/TileAlgorithm";
import { EventEmitter } from "../../core/common/event/EventEmitter";
import { GameEvent } from "./GameEvent";
import { DrawTileMode, LogicTileType, UnitType } from "../../logic/common/enums";
import { BuildInfo } from "../unit/BuildInfo";
import { GameUtils } from "./GameUtils";
import { GameLayer } from "../GameLayer";
import { UnitTransform } from "../unit/UnitInfo";


export class GameContext {
    static instance: GameContext = null;

    public static getInstance(): GameContext {
        if (!this.instance) {
            this.instance = new GameContext();
        }
        return this.instance;
    }

    public static destroy(): void {
        if (this.instance) {
            this.instance = null;
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    // 细分倍数
    public LOGIC_SCALE: number = 2;
    // X轴格子数量
    public X_COUNT: number = 40;
    // Y轴格子数量
    public Y_COUNT: number = 40;
    // 格子宽度
    public TILE_WIDTH: number = 64;
    // 格子高度
    public TILE_HEIGHT: number = 32;

    ///////////////////////////////////////////////////////////////////////////////////////
    // 渲染格子算法
    public tileAlgorithm: TileAlgorithm;
    // 逻辑格子算法
    public logicTileAlgorithm: TileAlgorithm;


    // 逻辑格子类型
    public logicTileTypeArr: LogicTileType[] = [];
    // 正常渲染格子类型
    public tileTypeArr: UnitType[] = [];

    // 自动放置可选位置
    public autoPlacePosArr: cc.Vec2[] = [];


    // 游戏内部事件派发器
    eventEmitter : EventEmitter<GameEvent>;

    gameLayer: GameLayer = null;

    private constructor() {
        this.reset(40, 40, 64, 32);
        this.eventEmitter = new EventEmitter<GameEvent>();
    }

    /**
     * @param xcount X轴数量
     * @param ycount Y轴数量
     * @param width 瓦片宽度
     * @param height 瓦片高度
     */
    reset(xcount: number, ycount: number, width: number, height: number) {
        this.X_COUNT = xcount;
        this.Y_COUNT = ycount;
        this.TILE_WIDTH = width;
        this.TILE_HEIGHT = height;
        
        this.tileAlgorithm = new TileAlgorithm(width, height, xcount, ycount);
        this.logicTileAlgorithm = new TileAlgorithm(width / this.LOGIC_SCALE, height / this.LOGIC_SCALE, xcount * this.LOGIC_SCALE, ycount * this.LOGIC_SCALE);

        this.tileTypeArr.length = this.tileAlgorithm.X_COUNT * this.tileAlgorithm.Y_COUNT;
        this.logicTileTypeArr.length = this.logicTileAlgorithm.X_COUNT * this.logicTileAlgorithm.Y_COUNT;


        this.autoPlacePosArr.length = this.tileTypeArr.length;
        for(let x = 0; x < this.X_COUNT; ++x) {
            for(let y = 0; y < this.Y_COUNT; ++y) {
                this.autoPlacePosArr[y * this.X_COUNT + x] = new cc.Vec2(x, y);
            }
        }

        let center = new cc.Vec2(Math.floor(this.X_COUNT * 0.5), Math.floor(this.Y_COUNT * 0.5));
        let distanceA = new cc.Vec2();
        let distanceB = new cc.Vec2();
        this.autoPlacePosArr.sort((a: cc.Vec2, b: cc.Vec2)=>{
            distanceA.x = center.x - a.x;
            distanceB.y = center.y - b.y;
            return distanceA.lengthSqr() - distanceB.lengthSqr();
        });

        this.clearTileData();
    }

    clearTileData() {
        let len = this.tileTypeArr.length;
        for(let i = 0; i < len; ++i) {
            this.tileTypeArr[i] = UnitType.None;
        }

        len = this.logicTileTypeArr.length;
        for(let i = 0; i < len; ++i) {
            this.logicTileTypeArr[i] = LogicTileType.None;
        }
    }

    addBuild(build: BuildInfo) {
        this.modifyBuild(build, GameUtils.bitSet);
    }

    delBuild(build: BuildInfo) {
        this.modifyBuild(build, GameUtils.bitDel);
    }

    canPlace(transform: UnitTransform) {
        const posX = transform.x;
        const posY = transform.y;
        const xCount = transform.xCount;
        const yCount = transform.yCount;
        const unitType = UnitType.buildings;

        if(posX < 0 || posY < 0 || posX > this.X_COUNT - xCount || posY > this.Y_COUNT - yCount) {
            return false;
        }

        let index = 0;
        for(let x = 0; x < xCount; ++x) {
            for(let y = 0; y < yCount; ++y) {
                index = x + posX + (y + posY) * this.X_COUNT;
                if(GameUtils.bitGet(this.tileTypeArr[index], unitType) == unitType) {
                    return false;
                }
            }
        }

        return true;
    }

    getPlacePos(xCount: number, yCount: number) {
        let outPos = new cc.Vec2(-1, -1);

        let transform : UnitTransform = new UnitTransform(0, 0, xCount, yCount);

        let tmp: cc.Vec2;
        for(let i = 0, j = this.autoPlacePosArr.length; i < j; ++i) {
            tmp = this.autoPlacePosArr[i];
            transform.x = tmp.x;
            transform.y = tmp.y;

            if(this.canPlace(transform)) {
                outPos.set(tmp);
                break;
            }            
        }
        return outPos;
    }

    modifyBuild(build: BuildInfo, operation: Function) {
        const transform = build.unit.transform;
        const buildCfg = build.buildCfg;

        let posX = transform.x;
        let posY = transform.y;
        let xCount = transform.xCount;
        let yCount = transform.yCount;        
        let index = 0;

        for(let x = 0; x < xCount; ++x) {
            for(let y = 0; y < yCount; ++y) {
                index = x + posX + (y + posY) * this.X_COUNT;
                this.tileTypeArr[index] = operation(this.tileTypeArr[index], build.unitType)
            }
        }

        posX *= this.LOGIC_SCALE;
        posY *= this.LOGIC_SCALE;
        xCount *= this.LOGIC_SCALE;
        yCount *= this.LOGIC_SCALE;
        for(let x = 0; x < xCount; ++x) {
            for(let y = 0; y < yCount; ++y) {
                index = x + posX + (y + posY) * this.X_COUNT * this.LOGIC_SCALE;
                
                this.logicTileTypeArr[index] = operation(this.logicTileTypeArr[index], LogicTileType.buildings);

                if(x >= buildCfg.LogicOffsetX && 
                    y >= buildCfg.LogicOffsetY &&
                    x < buildCfg.LogicOffsetX + buildCfg.LogicX &&
                    y < buildCfg.LogicOffsetY + buildCfg.LogicY) {
                    this.logicTileTypeArr[index] = operation(this.logicTileTypeArr[index], LogicTileType.walkable);
                }
            }
        }

        this.eventEmitter.emit(GameEvent.ON_NTF_UPDATE_TILE_DATA);
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
                let LOGIC_SCALE = this.LOGIC_SCALE

                let fillColor = g.fillColor;
                let strokeColor = g.strokeColor;

                algorithm.setDrawTileOffset(this.X_COUNT * algorithm.TILE_WIDTH_HALF * LOGIC_SCALE, 0.0);
                algorithm.drawTile(g, 0, 0, this.X_COUNT * LOGIC_SCALE, this.Y_COUNT * LOGIC_SCALE, (logicx: number, logicy: number, renderPos: cc.Vec2) =>{
                    let index = logicx + logicy * this.Y_COUNT * LOGIC_SCALE;
                    let type = this.logicTileTypeArr[index];

                    if(type & LogicTileType.walkable) {
                        g.fillColor = cc.Color.GREEN.clone();
                        g.strokeColor = cc.Color.GREEN.clone();
                        g.fillColor.a = 100;                        
                    }
                    else if(type & LogicTileType.buildings) {
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
            case DrawTileMode.ShowRenderTile: {
                let algorithm = this.tileAlgorithm;

                algorithm.setDrawTileOffset(this.X_COUNT * algorithm.TILE_WIDTH_HALF, 0.0);
                algorithm.drawTile(g, 0, 0, this.X_COUNT, this.Y_COUNT, (logicx: number, logicy: number, renderPos: cc.Vec2) =>{
                    let index = logicx + logicy * this.Y_COUNT;
                    let type = this.tileTypeArr[index];

                    if(type & UnitType.buildings) {
                        g.fillColor = cc.Color.RED.clone();
                        g.strokeColor = cc.Color.RED.clone();
                        g.fillColor.a = 100;
                    }
                    else{
                        g.fillColor = cc.Color.GREEN.clone();
                        g.strokeColor = cc.Color.GREEN.clone();
                        g.fillColor.a = 100;                    
                    }
                });
                break;
            }
        };
    }

    canWalk(x: number, y:number): boolean {
        let index = x + y * this.logicTileAlgorithm.X_COUNT;
        let value = this.logicTileTypeArr[index];
        return value === LogicTileType.None || GameUtils.bitGet(value, LogicTileType.walkable) === LogicTileType.walkable;
    }
}
