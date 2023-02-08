/*
 * Created: 2022-03-11 16:20:48
 * Author : fc
 * Description: 管理UI节点空白处点击以及遮罩显示相关
 */



import { core } from "../InitCore";
import { UIContext } from "./UIContext";
import { UIDelegate } from "./UIDelegate";
import { CoreEvent } from "../common/event/CoreEvent";
const {ccclass, property, menu} = cc._decorator;

@ccclass()
@menu("core/ui/UIPanel")
export class UIPanel extends cc.Component {    
    // 遮罩节点
    @property(cc.Node)
    maskNode: cc.Node = null;

    // UI节点（由Prefab实例化出来的节点）
    _uiNode: cc.Node = null;

    _delegate: UIDelegate = null;


    // 是否显示遮罩
    @property({visible: false})
    get showMask() {
        return this._showMask;
    }
    set showMask(value) {
        this._showMask = value;
        this.updateMaskLayer();
    }
    private _showMask = true;
    
    onLoad () {
    }

    initUI(uiNode: cc.Node, ctx: UIContext) {
        uiNode.parent = this.node;

        let delegate = uiNode.getComponent(UIDelegate);
        if(!delegate)
            delegate = uiNode.addComponent(UIDelegate);

        delegate.UICtx = ctx;

        this._uiNode = uiNode;
        this._delegate = delegate;
        
        // UI内容节点订阅触摸事件
        let touchNode = delegate.contentNode;
        if(touchNode)
        {
            touchNode.on(cc.Node.EventType.TOUCH_START, function (event) {
                event.stopPropagation();
            }, this);
            touchNode.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
                // 拖拽支持
                if(this._delegate.enableDrag && this._delegate.contentNode) {
                    var delta = event.touch.getDelta();
                    this._delegate.contentNode.x += delta.x;
                    this._delegate.contentNode.y += delta.y;
                }
                event.stopPropagation();
            }, this);
            touchNode.on(cc.Node.EventType.TOUCH_END, function (event) {
                event.stopPropagation();
            }, this);
        }

        this.updateMaskLayer();

        // UI节点背景订阅事件
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            // 点击空白处是否吞噬触摸事件
            (this.node as any)._touchListener.setSwallowTouches(this._delegate.swallowTouch);
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            // 点击空白处是否自动关闭
            if(this._delegate.autoDismiss)
                core.ui.current().popUI(this._uiNode);
        }, this);
    }

    public open(callback: Function) {
        this._uiNode.emit(CoreEvent.UI_ON_WILL_OPEN);
        this._delegate.onUIBeforeOpened();
        this._delegate.doOpenAction(()=>{
            this._uiNode.emit(CoreEvent.UI_ON_OPEN_FINISH);
            this._delegate.onUIAfterOpened();
            callback();
        });
    }

    public close(callback: Function) {
        this._uiNode.emit(CoreEvent.UI_ON_WILL_CLOSE);
        this._delegate.onUIWillClose();
        this._delegate.doCloseAction(callback);
        return true;
    }
    
    public dismiss() {
        this._uiNode.emit(CoreEvent.UI_ON_CLOSE_FINISH);
        this._delegate.onUIDismiss();
    }

    public canCloseUI(): boolean {
        return this._delegate.canCloseUI();
    }

    private updateMaskLayer(){
        if(this._delegate)
            this.maskNode.active = this._showMask && this._delegate.showMaskLayer;
        else
            this.maskNode.active = false;
    }
};