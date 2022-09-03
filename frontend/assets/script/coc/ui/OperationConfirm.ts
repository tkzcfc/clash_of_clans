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
import { GameBuild } from "../unit/GameBuild";



const {ccclass, property} = cc._decorator;

const Invalid_SN = -1;

@ccclass()
export class OperationConfirm extends cc.Component {
    
    requestSN: number = Invalid_SN;

    onClickOK() {
        if(this.requestSN !== Invalid_SN) {
            return;
        }
        this.buyAndPlaceToMap();
    }

    async buyAndPlaceToMap() {
        this.requestSN = mgr.getMgr(RpcMgr).client.nextSN;

        // 获取目标建筑
        let followTarget = this.getComponent(UnitFollow).followTarget;
        let build = followTarget.getComponent(GameBuild);

        let result = await mgr.getMgr(RpcMgr).callApi("ptl/BuyAndPlaceToMap", {
            id: build.unit.config.Id,
            x: build.unit.x,
            y: build.unit.y,
        });

        this.requestSN = Invalid_SN;

        if(result.isSucc) {
            build.unitUUID = result.res.data.uuid;
            build.lv = result.res.data.lv;

            GameContext.getInstance().eventEmitter.emit(GameEvent.DO_UNFOCUS_UNIT, true, false);
            this.node.destroy();
        }
    }

    protected onDestroy(): void {
        mgr.getMgr(RpcMgr).client.abort(this.requestSN);
    }

    onClickCancel() {
        if(this.requestSN !== Invalid_SN) {
            return;
        }
        GameContext.getInstance().eventEmitter.emit(GameEvent.DO_UNFOCUS_UNIT, true, true);
        this.node.destroy();
    }
}
