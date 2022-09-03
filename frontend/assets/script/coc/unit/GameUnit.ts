/*
 * Created: 2022-03-26 10:40:00
 * Author : fc
 * Description: 
 */

import { LogicTileType, UnitType } from "../const/enums";
import { GameBuild } from "./GameBuild";
import { GameContext } from "../misc/GameContext";
import { GameEvent } from "../misc/GameEvent";
import { GameUnitBase } from "./GameUnitBase";


const {ccclass, property} = cc._decorator;

@ccclass()
export class GameUnit extends GameUnitBase {
    // 触摸开始标记
    _touchStartTag: boolean = false;
    // 触摸拖动标记
    _dragTag: boolean = false;
    // 触摸时间
    _touchTime: number = 0;
    // 触发了长按
    _triggerLongTouch: boolean = false;
    
    touchTest(event) {
        if(this.type == UnitType.Buildings) {
            let pos = this.node.parent.convertToNodeSpaceAR(event.touch.getLocation());
            return this.getComponent(GameBuild).touchTest(pos);
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
};