/*
 * Created: 2022-03-22 13:36:05
 * Author : fc
 * Description: 
 */

import { core } from "../core/InitCore";
import { View } from "../core/view_manager/View";
import { Const } from "../common/Const";
import { mgr } from "../manager/mgr";
import { GameDataMgr } from "../manager/GameDataMgr";
import { GameMode } from "../coc/const/enums";

const {ccclass, property} = cc._decorator;

@ccclass()
export default class GameView extends View {

    protected start(): void {
        if(mgr.getMgr(GameDataMgr).getCurrentMode() == GameMode.Fight) {
            core.ui.current().pushUI(Const.UIs.Fight_Main);
        }
        else {
            core.ui.current().pushUI(Const.UIs.Main);
        }
    }
}
