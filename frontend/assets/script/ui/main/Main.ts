import { core } from "../../core/InitCore";
import { UIDelegate } from "../../core/ui_manager/UIDelegate";
import { Const } from "../../common/Const";

const {ccclass, property} = cc._decorator;

@ccclass()
export class Main extends UIDelegate {

    
    onClickShop() {
        core.ui.current().pushUI(Const.UIs.Shop);
    }

    onClickFight() {
        core.ui.current().pushUI(Const.UIs.Fight_PlayerList);
    }

    
    /** UI即将关闭 
     * @returns 返回false则表示中断此次关闭
    */
     public onUIWillClose(): boolean {
        return false;
    }
};
