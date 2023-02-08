/*
 * Created: 2022-03-11 16:21:14
 * Author : fc
 * Description: UI管理，主要管理UI上下文
 */

import Stack from "../utils/Stack";
import { UIContext } from "./UIContext";
import { core } from "../InitCore";


export class UIManager {

    uiCtxStack: Stack<UIContext>;
    
    constructor() {
        this.uiCtxStack = new Stack<UIContext>();
    }

    pushContext() {
        if(!this.uiCtxStack.isEmpty()){
            this.uiCtxStack.last().pause();
        }

        let node = cc.instantiate(core.uiContextPrefab);
        node.parent = core.guiRootNode;

        this.uiCtxStack.push(node.getComponent(UIContext));
    }

    popContext() {
        let ctx = this.uiCtxStack.pop();
        ctx.destroyAllUI();
        ctx.node.destroy();

        if(!this.uiCtxStack.isEmpty()) {
            this.uiCtxStack.last().resume();
        }
    }

    current() {
        return this.uiCtxStack.last();
    }
}

