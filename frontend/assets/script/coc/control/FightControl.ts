/*
 * Created: 2022-06-09 16:32:51
 * Author : fc
 * Description: 战斗模式-游戏控制器
 */

import { GameZIndex } from "../const/enums";
import { GameLayer } from "../GameLayer";
import { GameContext } from "../misc/GameContext";
import { GameEvent } from "../misc/GameEvent";
import { BaseControl } from "./BaseControl";
import { GameUtils } from "../misc/GameUtils";
import { mgr } from "../../manager/mgr";
import { GameCfgMgr } from "../../manager/GameCfgMgr";


export class FightControl extends BaseControl
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
        if(!touchLocation) {
            return;
        }

        const algorithm = GameContext.getInstance().logicTileAlgorithm;

        let pos = this.gameLayer.layers[GameZIndex.UnitLayer].convertToNodeSpaceAR(touchLocation);
        pos = algorithm.calculateLogicPos(pos.x, pos.y);
        if(algorithm.contain(pos.x, pos.y)) {

            let ids = [];
            mgr.getMgr(GameCfgMgr).walkData("Role", (data)=>{
                ids.push(data.Id);
                return false;
            });
            
            let id = ids[GameUtils.randomRangeInt(0, ids.length - 1)];
            this.gameLayer.newRole(id, 1, pos.x, pos.y);
        }
    }
}