/*
 * Created: 2022-03-22 10:20:20
 * Author : fc
 * Description: view管理
 */

import { CoreEvent } from "../common/event/CoreEvent";
import { core } from "../InitCore";
import Stack from "../utils/Stack";
import { View } from "./View";
import { RenderUtil } from "../utils/RenderUtil";



export class ViewManager {
    viewStack: Stack<View>;

    constructor() {
        this.viewStack = new Stack<View>();

        core.sysEventEmitter.on(CoreEvent.UI_ON_VIEW_VISIBLE, (show: boolean, ctx)=>{
            if(ctx === core.ui.current() && this.curView()) {
                RenderUtil.setNodeVisible(this.curView().node, show);
            }
        }, this);
    }

    async runView(url: string) {
        let cur = this.curView();
        if(cur) {
            cur.addComponent(cc.BlockInputEvents);
        }

        return new Promise<void>((resolve, reject) => {
            cc.resources.load(url, cc.Prefab, (error: Error, prefab: cc.Prefab)=>{
                if(cur) {
                    cur.getComponent(cc.BlockInputEvents).destroy();
                }
                if(error) {
                    cc.error(`加载预制体:(${url})失败,View无法创建`);
                    reject();
                    return;
                }
                
                this.popView();
                this._runView(cc.instantiate(prefab));
                resolve();
            });
        });
    }

    async pushView(url: string) {
        let cur = this.curView();
        if(cur) {
            cur.addComponent(cc.BlockInputEvents);
        }

        return new Promise<void>((resolve, reject) => {
            cc.resources.load(url, cc.Prefab, (error: Error, prefab: cc.Prefab)=>{
                if(cur) {
                    cur.getComponent(cc.BlockInputEvents).destroy();
                }
    
                if(error) {
                    cc.error(`加载预制体:(${url})失败,View无法创建`);
                    reject();
                    return;
                }
                
                if(cur) {
                    cur.node.active = false;
                }
                this._runView(cc.instantiate(prefab));
                resolve();
            });
        });
    }
    
    runEmptyView() {
        this.popView();
        this._runView(new cc.Node());
    }

    pushEmptyView() {
        let cur = this.curView();
        if(cur) {
            cur.node.active = false;
        }
        this._runView(new cc.Node());
    }

    popView() {
        if(!this.viewStack.isEmpty()) {
            let back = this.viewStack.pop();
            back.node.destroy();
            core.ui.popContext();

            if(!this.viewStack.isEmpty()) {
                this.viewStack.last().node.active = true;
            }
        }
    }

    stackSize() {
        return this.viewStack.size();
    }

    curView() {
        if(!this.viewStack.isEmpty()) {
            return this.viewStack.last();
        }
    }

    _runView(node: cc.Node) {
        let view = node.getComponent(View);
        if(!view) {
            view = node.addComponent(View);
        }
        node.parent = core.gameRootNode;

        core.ui.pushContext();
        this.viewStack.push(view);        
    }
}


