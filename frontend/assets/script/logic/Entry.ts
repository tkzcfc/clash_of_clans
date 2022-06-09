/*
 * Created: 2022-03-10 17:12:53
 * Author : fc
 * Description: 游戏入口
 */

import { core } from "../core/InitCore";
import Root from "../core/Root"
import { Const } from "./common/Const";
import { mgr } from "./manager/mgr";
const {ccclass, property} = cc._decorator;

@ccclass()
export default class Entry extends Root {

    onLoad () {
        // 框架初始化
        super.onLoad();
        // mgr初始化
        mgr.initialize();
        
        // // 开启动态合批
        // cc.macro.CLEANUP_IMAGE_CACHE = false;
        // cc.dynamicAtlasManager.enabled = true;
        // 关闭自动合批
        cc.dynamicAtlasManager.enabled = false;
    }

    protected start(): void {
        core.viewManager.runEmptyView();
        core.ui.current().pushUI(Const.UIs.Login);
    }
}
