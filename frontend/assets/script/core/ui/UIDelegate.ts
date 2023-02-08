/*
 * Created: 2022-03-12 14:06:09
 * Author : fc
 * Description: UI代理
 */

import { UIContext } from "./UIContext";

const {ccclass, property, menu} = cc._decorator;

// 入场/退场动画类型
export enum ActionType {
    NoAction,
    ScaleAction,
}

// UI 类型
export enum UIType {
    // 普通UI
    Normal,
    // 全屏类型UI (打开之后会自动隐藏下方UI)
    FullScreen,
}



@ccclass()
@menu("core/ui/ui")
export class UIDelegate extends cc.Component {

    @property({
        tooltip: "是否点击空白处自动关闭界面",
    })
    autoDismiss: boolean = true;
    
    @property({
        tooltip: "是否截断空白处触摸事件",
    })
    swallowTouch: boolean = true;

    @property({
        tooltip: "支持内容节点拖拽",
    })
    enableDrag: boolean = true;
    
    @property({
        tooltip: "是否显示遮罩",
    })
    showMaskLayer: boolean = true;

    @property({
        type: cc.Node,
        tooltip: "内容节点",
    })
    contentNode: cc.Node;

    
    @property({
        type: cc.Enum(ActionType),
        tooltip: "打开动画类型",
    })
    openActType: ActionType = ActionType.ScaleAction;

    @property({
        type: cc.Enum(ActionType),
        tooltip: "关闭动画类型",
    })
    closeActType: ActionType = ActionType.ScaleAction;

    
    @property({
        type: cc.Enum(UIType),
        tooltip: "UI类型",
    })
    uiType: UIType = UIType.Normal;

    // 当前UI上下文
    set UICtx(ctx) {
        this._uiCtx = ctx;
    }
    get UICtx() {
        return this._uiCtx;
    }
    _uiCtx : UIContext;

    // 初始化参数
    initParams: any = undefined;
    
    //////////////////////////////////////////////////////// function ////////////////////////////////////////////////////////
    public closeSelf() {
        this.UICtx.popUI(this.node);
    }


    //////////////////////////////////////////////////////// interface ////////////////////////////////////////////////////////

    /** UI即将打开 */
    public onUIBeforeOpened() {
    }

    /** UI打开完毕 */
    public onUIAfterOpened() {
    }

    /** UI即将关闭 
    */
    public onUIWillClose() {
    }

    /** UI关闭完成(即将销毁) */
    public onUIDismiss() {
    }

    /** 是否可以关闭UI */
    public canCloseUI(): boolean {
        return true;
    }

    
    /**
     * 执行打开动画
     * @param callback 动画完成之后的回调
     */
     public doOpenAction(callback: Function) {
        let actNode = this.contentNode || this.node;
        switch (this.openActType) {
            case ActionType.NoAction:
            {
                callback();
                break;
            }
            case ActionType.ScaleAction:
            {
                actNode.opacity = 0;
                cc.tween(actNode)
                    .to(0, { scaleX: 0.2, scaleY: 0.2, opacity: 100 })
                    .to(0.25, { scaleX: 1.1, scaleY: 1.1, opacity: 255 })
                    .to(0.1, { scaleX: 1, scaleY: 1})
                    .call(callback)
                    .start();
                break;
            }
            default:
                console.assert(false);
                break;
        }
    }

    /**
     * 执行关闭动画
     * @param callback 动画完成之后的回调
     */
    public doCloseAction(callback: Function) {
        let actNode = this.contentNode || this.node;

        // 根据打开动画类型回复相关属性
        switch (this.openActType) {
            case ActionType.ScaleAction:
            {
                actNode.setScale(1, 1, 1)
                actNode.opacity = 255;
                break;
            }
        }

        switch (this.closeActType) {
            case ActionType.NoAction:
            {
                callback();
                break;
            }
            case ActionType.ScaleAction:
            {
                cc.tween(actNode)
                    .to(0.1, { scaleX: 1.2, scaleY: 1.2 })
                    .to(0.25, { scaleX: 0.3, scaleY: 0.3, opacity: 100 })
                    .call(callback)
                    .start();
                break;
            }
            default:
                console.assert(false);
                break;
        }
    }
};