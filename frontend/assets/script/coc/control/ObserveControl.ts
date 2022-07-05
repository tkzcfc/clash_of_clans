/*
 * Created: 2022-07-05 16:22:44
 * Author : fc
 * Description: 观察模式-游戏控制器
 */

import { GameLayer } from "../GameLayer";
import { GameContext } from "../misc/GameContext";
import { GameEvent } from "../misc/GameEvent";
import { BaseControl } from "./BaseControl";


export class ObserveControl extends BaseControl
{

    initialize(gameLayer: GameLayer): void {
        super.initialize(gameLayer);

        // 游戏内部事件订阅
        let eventEmitter = GameContext.getInstance().eventEmitter;
        eventEmitter.on(GameEvent.ON_NTF_CLICK_EMPTY, this.onEventClickEmpty, this);
    }

    canFocusOnClickUnit() {
        return false;
    }

    /**
     * 事件-点击空白处
     */
    onEventClickEmpty(touchLocation: cc.Vec2 | undefined) {
    }
}