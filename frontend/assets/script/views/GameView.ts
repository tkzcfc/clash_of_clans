/*
 * Created: 2022-03-22 13:36:05
 * Author : fc
 * Description: 游戏场景
 */

import { core } from "../core/InitCore";
import { View } from "../core/view_manager/View";
import { Const } from "../common/Const";
import { mgr } from "../manager/mgr";
import { GameDataMgr } from "../manager/GameDataMgr";
import { GameMode } from "../coc/const/enums";
import { LoadProgress } from "../ui/common/LoadProgress";

const {ccclass, property} = cc._decorator;

interface Resource {
    url: string,
    // 资源类型
    assetType: typeof cc.Asset,
    // 当前加载进度
    percent: number,
    // 资源实例
    asset: cc.Asset | undefined
}

@ccclass()
export default class GameView extends View {

    loadProgress: LoadProgress;
    refResources: Resource[] = [];

    protected start(): void {
        this.addResource("prefab/game/gameLayer", cc.Prefab);
        this.addResource(mgr.getMgr(GameDataMgr).getBGM(), cc.AudioClip);

        core.ui.current().pushUI(Const.UIs.LoadProgress).then(node=> {
            this.loadProgress = node.getComponent(LoadProgress);
            this.loadProgress.setFinishCallback(()=>{
                this.loadComplete();
            });
            this.startLoad();
        });
    }

    protected onDestroy(): void {
        this.refResources.forEach((value)=>{
            if(value.asset) {
                // 不自动释放
                // @ts-ignore
                value.asset.decRef(false);
            }
        });
    }

    /**
     * 开始加载资源
     * @returns 
     */
    protected startLoad() {
        if(this.refResources.length <= 0) {
            this.loadProgress.updateProgress(1.0, true);
            return;
        }

        let curCount = 0;
        this.refResources.forEach((value)=>{
            cc.resources.load(value.url, value.assetType, (finish: number, total: number, item)=>{
                if(finish >= total) {
                    value.percent = 1.0;
                }
                else {
                    value.percent = finish / total;
                }
                this.updatePercent();
            }, (err, asset)=>{
                if(err) {
                    console.error(`load URL:${value.url}, failed.`)
                }

                curCount++;
                value.percent = 1.0;
                value.asset = asset;
                if(asset) {
                    asset.addRef();
                }

                // 加载完成
                if(curCount >= this.refResources.length) {
                    this.loadProgress.updateProgress(1.0, true);
                }
                else {
                    this.updatePercent();
                }
            });
        });
    }

    /**
     * 资源加载完成，初始化游戏地图
     */
    protected loadComplete() {
        cc.resources.load("prefab/game/gameLayer", cc.Prefab, (err, asset: cc.Prefab)=>{
            let node = cc.instantiate(asset);
            this.node.addChild(node);

            // // 调用updateAlignment刷新
            // node.getComponent(cc.Widget).updateAlignment();

            this.loadProgress.closeSelf();
            
            if(mgr.getMgr(GameDataMgr).getCurrentMode() == GameMode.Fight) {
                core.ui.current().pushUI(Const.UIs.Fight_Main);
            }
            else {
                core.ui.current().pushUI(Const.UIs.Main);
            }
        });

        // 资源加载完毕后，调用释放未使用的资源
        // @ts-ignore
        cc.assetManager.releaseUnusedAssets()
    }

    /**
     * 更新进度
     */
    protected updatePercent() {
        let total = this.refResources.length;
        let cur = 0;

        this.refResources.forEach((value) =>{
            cur += value.percent;
        })

        this.loadProgress.updateProgress(cur / total);
    }

    /**
     * 添加资源加载任务
     * @param url 
     * @param assetType 
     * @returns 
     */
    protected addResource(url: string, assetType: typeof cc.Asset) {
        for(let i = 0, j = this.refResources.length; i < j; ++i) {
            const resource = this.refResources[i];
            if(resource.url === url && resource.assetType === assetType) {
                return;
            }
        }

        this.refResources.push({
            url: url,
            assetType: assetType,
            percent: 0.0,
            asset: undefined
        });
    }
}
