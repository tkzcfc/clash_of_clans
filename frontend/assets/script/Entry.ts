/*
 * Created: 2022-03-10 17:12:53
 * Author : fc
 * Description: 游戏入口
 */

import Root from "./core/Root"
import { Const } from "./common/Const";
import { core } from "./core/InitCore";
import { View } from "./core/view/View";
import HotfixView from "./views/HotfixView";
const {ccclass, property} = cc._decorator;

@ccclass()
export default class Entry extends Root {

    onLoad () {
        // 框架初始化
        super.onLoad();

        // // 开启动态合批
        // cc.macro.CLEANUP_IMAGE_CACHE = false;
        // cc.dynamicAtlasManager.enabled = true;
        // 关闭自动合批
        cc.dynamicAtlasManager.enabled = false;
    }

    protected start(): void {
        if(cc.sys.platform === cc.sys.ANDROID || cc.sys.platform === cc.sys.IPHONE || cc.sys.platform === cc.sys.IPAD) {
            core.viewManager.runEmptyView(HotfixView);
        }
        else {
            core.viewManager.runEmptyView(View);
            // core.ui.current().pushUI(Const.UIs.Login);
            core.ui.current().pushUI(Const.UIs.Tests);
        }
    }
}
