/*
 * Created: 2022-04-01 20:15:13
 * Author : fc
 * Description: 建筑物渲染
 */

import { GameCfgHelper } from "../../common/config/GameCfgHelper";
import { GameCfgMgr } from "../../manager/GameCfgMgr";
import { mgr } from "../../manager/mgr";
import { GameBuild } from "./GameBuild";
const {ccclass, property} = cc._decorator;


const FOCUS_ACTION_TAG = 1;

@ccclass
export default class GameBuildRender extends cc.Component {

    @property({ type: cc.Sprite, tooltip: "建筑渲染节点"})
    buildSpr: cc.Sprite = null;

    private buildInfo: GameBuild = null;
    private cacheBuildResource: string = "";
    
    protected onLoad(): void {
        this.buildSpr = this.node.getChildByName("render").getComponent(cc.Sprite);
        this.buildInfo = this.getComponent(GameBuild);
    }

    protected onDestroy(): void {
        this.buildInfo = null;
    }
    
    
    updateRender() {
        const lv = this.buildInfo.lv;
        const buildCfg = this.buildInfo.buildCfg;
        const itemCfg = mgr.getMgr(GameCfgMgr).getData("Items", this.buildInfo.cfgId);
        const url = GameCfgHelper.getItemImage(itemCfg, lv);

        // 更新建筑物资源
        if(this.cacheBuildResource !== url) {
            this.cacheBuildResource = url;
            
            let offsets = buildCfg.Offsets[lv - 1];
            // 建筑偏移设置
            if(offsets) {
                this.buildSpr.node.setPosition(offsets[0], offsets[1]);
            }
            else {
                this.buildSpr.node.setPosition(buildCfg.OffsetX, buildCfg.OffsetY);
            }
            // 建筑缩放
            this.buildSpr.node.setScale(buildCfg.ScaleX, buildCfg.ScaleY, 1.0);
            this.buildSpr.node.active = false;
            
            cc.resources.load(this.cacheBuildResource, cc.SpriteFrame, (err, sprFrame: cc.SpriteFrame)=>{
                this.buildSpr.node.active = true;
                this.buildSpr.spriteFrame = sprFrame;
            });
        }
    }


    /**
     * 执行聚焦动画
     */
    runFocusAction() {
        this.stopFocusAction();

        let action = cc.repeatForever(
            cc.sequence(
                cc.tintTo(0.5, 150, 200, 150),
                cc.tintTo(0.5, 255, 255, 255),
            )
        );
        action.setTag(FOCUS_ACTION_TAG);
        this.buildSpr.node.runAction(action);
    }

    /**
     * 停止聚焦动画
     */
    stopFocusAction() {
        this.buildSpr.node.stopActionByTag(FOCUS_ACTION_TAG);
        this.buildSpr.node.color = cc.Color.WHITE;
    }
}
