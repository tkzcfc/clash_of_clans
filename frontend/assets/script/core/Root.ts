/*
 * Created: 2022-03-12 10:39:42
 * Author : fc
 * Description: 
 */

import { EventEmitter } from "./common/event/EventEmitter";
import { core } from "./InitCore";
import { UIManager } from "./ui/UIManager";
import { ViewManager } from "./view/ViewManager";
const {ccclass, property} = cc._decorator;

@ccclass('Root')
export default class Root extends cc.Component {
    @property({
        type: cc.Prefab,
        tooltip: "UIContext预制体"
    })
    uiContextPrefab: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        tooltip: "UIPanel预制体"
    })
    uiPanelPrefab: cc.Prefab = null;

    onLoad() {
        core.storage.init("key", "abc");

        core.uiContextPrefab = this.uiContextPrefab;
        core.uiPanelPrefab = this.uiPanelPrefab;

        core.sysEventEmitter = new EventEmitter<string>();

        core.gameRootNode = cc.find("root/game");
        core.guiRootNode = cc.find("root/gui");

        core.ui = new UIManager();
        core.viewManager = new ViewManager();
    }
};