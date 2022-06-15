/*
 * Created: 2022-03-22 13:36:05
 * Author : fc
 * Description: 
 */

import { core } from "../core/InitCore";
import { View } from "../core/view_manager/View";
import { Const } from "../common/Const";
import { FightMgr } from "../manager/FightMgr";
import { mgr } from "../manager/mgr";

const {ccclass, property} = cc._decorator;

@ccclass()
export default class GameView extends View {

    protected start(): void {
        if(mgr.getMgr(FightMgr).hasFightInfo) {
            core.ui.current().pushUI(Const.UIs.Fight_Main);
        }
        else {
            core.ui.current().pushUI(Const.UIs.Main);
        }
    }
}
