import { core } from "../../../core/InitCore";
import { UIDelegate } from "../../../core/ui_manager/UIDelegate";
import { Const } from "../../common/Const";
import { FightMgr } from "../../manager/FightMgr";
import { mgr } from "../../manager/mgr";
import { UIUtils } from "../UIUtils";

const {ccclass, property} = cc._decorator;

@ccclass()
export class FightMain extends UIDelegate {

    
    onClickBack() {
        UIUtils.showMsgBoxTwo("是否结束战斗?", ()=>{
            mgr.getMgr(FightMgr).clear();
            core.viewManager.runView(Const.Views.GameView);
        }, ()=>{

        });
    }
    
    /** UI即将关闭 
     * @returns 返回false则表示中断此次关闭
    */
     public onUIWillClose(): boolean {
        return false;
    }
};
