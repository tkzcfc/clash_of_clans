/*
 * Created: 2022-03-26 10:40:00
 * Author : fc
 * Description: 
 */

import { UnitType } from "../../logic/common/enums";
import { BuildInfo } from "./BuildInfo";
import { GameContext } from "../misc/GameContext";
import { GameEvent } from "../misc/GameEvent";


const {ccclass, property} = cc._decorator;


export class UnitTransform {
    x: number;
    y: number;
    xCount: number;
    yCount: number;

    constructor(x: number, y: number, xcount: number, ycount: number) {
        this.x = x;
        this.y = y;
        this.xCount = xcount;
        this.yCount = ycount;
    }

    subdivide(out: UnitTransform) {
        let scale = GameContext.getInstance().LOGIC_SCALE;
        out.x = this.x * scale;
        out.y = this.y * scale;
        out.xCount = this.xCount * scale;
        out.yCount = this.yCount * scale;
    }

    getMinX(): number {
        return this.x;
    }
    
    getMaxX(): number {
        return this.x + this.xCount - 1;
    }
    
    getMinY(): number {
        return this.y;
    }
    
    getMaxY(): number {
        return this.y + this.yCount - 1;
    }
}


@ccclass()
export class UnitInfo extends cc.Component {

    @property({type: cc.Enum(UnitType)})
    type: UnitType = UnitType.buildings;

    // 渲染位置属性
    transform: UnitTransform = new UnitTransform(0, 0, 1, 1);
    // 逻辑位置属性
    logicTransform: UnitTransform = new UnitTransform(0, 0, 1, 1);

    // 触摸开始标记
    _touchStartTag: boolean = false;
    // 触摸拖动标记
    _dragTag: boolean = false;
    // 触摸时间
    _touchTime: number = 0;
    // 触发了长按
    _triggerLongTouch: boolean = false;

    touchTest(event) {
        if(this.type == UnitType.buildings) {
            let pos = this.node.parent.convertToNodeSpaceAR(event.touch.getLocation());
            return this.getComponent(BuildInfo).touchTest(pos);
        }
        return false;
    }
    
    onTouchStart(event) {
        this._touchStartTag = true;
        this._touchTime = 0;
        this._dragTag = false;
        this._triggerLongTouch = false;
    }

    onTouchMove(event) {
        if(!this._dragTag) {    
            let start = event.touch.getStartLocation();
            let cur = event.touch.getLocation();
            let distance = new cc.Vec2(start.x - cur.x, start.y - cur.y);

            this._dragTag = distance.lengthSqr() > 16;
        }
    }
    
    onTouchEnd(event) {
        // 点击事件
        if(!this._dragTag && !this._triggerLongTouch) {
            GameContext.getInstance().eventEmitter.emit(GameEvent.ON_NTF_CLICK_UNIT, this, event);
        }
        
        this._touchStartTag = false;
        this._touchTime = 0;
        this._dragTag = false;
        this._triggerLongTouch = false;
    }

    onDragFocusUnit(event) {
        let start = this.node.parent.convertToNodeSpaceAR(event.touch.getStartLocation());
        let cur = this.node.parent.convertToNodeSpaceAR(event.touch.getLocation());
        let distance = new cc.Vec2(start.x - cur.x, start.y - cur.y);
        GameContext.getInstance().eventEmitter.emit(GameEvent.ON_NTF_DRAG_UNIT, this, distance, event);
    }

    protected update(dt: number): void {
        // 长按触发逻辑
        if(this._touchStartTag && !this._dragTag && !this._triggerLongTouch) {
            this._touchTime += dt;
            if(this._touchTime > 0.5) {
                // 触发长按
                this._triggerLongTouch = true;
                GameContext.getInstance().eventEmitter.emit(GameEvent.ON_NTF_LONG_TOUCH_UNIT, this);
            }
        }
    }

    /**
     * 获取当前占用格子大小
     */
    getTileSize(): cc.Vec2 {
        const algorithm = GameContext.getInstance().logicTileAlgorithm;
        return new cc.Vec2(algorithm.TILE_WIDTH * this.logicTransform.xCount, algorithm.TILE_HEIGHT * this.logicTransform.yCount);
    }
    
    /**
     * 是否包含该坐标
     * @param logicPos 
     * @returns 
     */
     containLogicPos(transform: UnitTransform, logicPos: cc.Vec2): boolean {
         return this.containLogicPosEx(transform, logicPos.x, logicPos.y);
    }

    
    /**
     * 是否包含该坐标
     * @param logicPos 
     * @returns 
     */
     containLogicPosEx(transform: UnitTransform, logicPosX: number, logicPosY: number): boolean {
        for(let y = 0; y < transform.yCount; ++y) {
            for(let x = 0; x < transform.xCount; ++x) {
                if(transform.x + x == logicPosX && transform.y + y == logicPosY) {
                    return true;
                }
            }
        }
        return false;
    }
};