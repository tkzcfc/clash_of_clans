/*
 * Created: 2022-03-28 11:30:49
 * Author : fc
 * Description: 操作确认UI
 */

import { mgr } from "../../manager/mgr";
import { RpcMgr } from "../../manager/RpcMgr";
import { GameContext } from "../misc/GameContext";
import { GameEvent } from "../misc/GameEvent";
import { UnitFollow } from "./UnitFollow";
import { Build } from "../unit/Build";



const {ccclass, property} = cc._decorator;

@ccclass()
export class OperationConfirm extends cc.Component {
    
    requestSN: number = -1;

    onClickOK() {
        this.buyAndPlaceToMap();
    }

    async buyAndPlaceToMap() {
        this.requestSN = mgr.getMgr(RpcMgr).client.nextSN;

        // 获取目标建筑
        let followTarget = this.getComponent(UnitFollow).followTarget;
        let build = followTarget.getComponent(Build);

        let result = await mgr.getMgr(RpcMgr).callApi("ptl/BuyAndPlaceToMap", {
            id: build.cfgId,
            x: build.unit.transform.x,
            y: build.unit.transform.y,
        });

        if(result.isSucc) {
            build.uuid = result.res.data.uuid;

            GameContext.getInstance().eventEmitter.emit(GameEvent.DO_UNFOCUS_UNIT, true, false);
            this.node.destroy();
        }
    }

    protected onDestroy(): void {
        mgr.getMgr(RpcMgr).client.abort(this.requestSN);
    }

    onClickCancel() {
        GameContext.getInstance().eventEmitter.emit(GameEvent.DO_UNFOCUS_UNIT, true, true);
        this.node.destroy();
    }
}
