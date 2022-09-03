import { core } from "../../core/InitCore";
import { UIDelegate } from "../../core/ui_manager/UIDelegate";
import { FightMgr } from "../../manager/FightMgr";
import { mgr } from "../../manager/mgr";
import { UIUtils } from "../UIUtils";
import GameView from "../../views/GameView";
import { Const } from "../../common/Const";

const {ccclass, property} = cc._decorator;

@ccclass()
export class FightMain extends UIDelegate {

    
    onClickBack() {
        UIUtils.showMsgBoxTwo("是否结束战斗?", ()=>{
            mgr.getMgr(FightMgr).clear();
            core.viewManager.runEmptyView(GameView);
        }, ()=>{

        });
    }
    
    /** UI即将关闭 
     * @returns 返回false则表示中断此次关闭
    */
     public onUIWillClose(): boolean {
        return false;
    }

    
    onClickDebug() {
        core.ui.current().pushUI(Const.UIs.DebugGamePanel);
    }
};
