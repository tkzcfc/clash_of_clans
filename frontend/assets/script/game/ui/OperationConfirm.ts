/*
 * Created: 2022-03-28 11:30:49
 * Author : fc
 * Description: 操作确认UI
 */

import { GameContext } from "../misc/GameContext";
import { GameEvent } from "../misc/GameEvent";



const {ccclass, property} = cc._decorator;

@ccclass()
export class OperationConfirm extends cc.Component {
    
    onClickOK() {
        GameContext.getInstance().eventEmitter.emit(GameEvent.DO_UNFOCUS_UNIT, true, false);
        this.node.destroy();

        cc.log("on click ok------->>>");
    }

    onClickCancel() {
        GameContext.getInstance().eventEmitter.emit(GameEvent.DO_UNFOCUS_UNIT, true, true);
        this.node.destroy();
    }
}
