/*
 * Created: 2022-03-11 16:21:05
 * Author : fc
 * Description: UI上下文,管理显示在当前Context的UI
 */


import { core } from "../InitCore";
import { UIPanel } from "./UIPanel";
import Queue from "../utils/Queue";
import { UIType } from "./UIDelegate";
import { CoreEvent } from "../common/event/CoreEvent";
import { RenderUtil } from "../utils/RenderUtil";

const {ccclass, property, menu} = cc._decorator;


enum UIState
{
    // 等待打开
    WAIT,
    // 预制体加载中
    LOADING,
    // 正在打开
    OPENING,
    // 正在运行
    RUN,
    // 正在关闭
    CLOSING,
    // 已销毁
    DESTROYED,
}

class UIInfo {
    // UI 预制体路径
    public prefabURL: string;
    // 
    public panel: UIPanel;
    // 当前状态
    public state: UIState;
    // UI初始化参数
    public params: any;
    // UI创建成功后的回调函数
    public callback: (node: cc.Node)=>void;
    // zorder
    public zorder: number;
    // uiname
    public uiname: string;
}


@ccclass()
export class UIContext extends cc.Component {

    @property(cc.Node)
    // UI根节点
    uiRootNode: cc.Node = null;

    // 屏蔽层节点
    @property(cc.Node)
    shieldingLayer: cc.Node = null;

    // 加载完毕的界面
    _uiPanels: UIInfo[] = [];

    // 正在等待打开的界面
    _waitOpenQueue: Queue<UIInfo>;

    // 正在打开的界面信息
    _curOpenInfo: UIInfo;

    // 当前ctx是否处于暂停状态
    _pauseTag: boolean;

    // 当前是否启用屏蔽
    set showShieldingLayer(value){
        this.shieldingLayer.active = value;
    }
    get showShieldingLayer(){
        return this.shieldingLayer.active;
    }
    
    onLoad () {
        this._pauseTag = false;
        this._waitOpenQueue = new Queue<UIInfo>();

        if(!this.uiRootNode)
            this.uiRootNode = this.node.getChildByName("UIRoot");

        if(!this.shieldingLayer)
            this.shieldingLayer = this.node.getChildByName("ShieldingLayer");

        this.showShieldingLayer = false;
    };

    contain(prefabURL: string) {
        if(this._curOpenInfo && this._curOpenInfo.prefabURL == prefabURL) {
            return true;
        }

        for(let i = 0, j = this._uiPanels.length; i < j; ++i) {
            if(this._uiPanels[i].prefabURL == prefabURL) {
                return true;
            }
        }

        let ok = false;
        this._waitOpenQueue.forEach((info : UIInfo)=>{
            if(info.prefabURL == prefabURL) {
                ok = true;
            }
        });

        return ok;
    }

    async pushUI(prefabURL: string | cc.Prefab, params?: any, zorder?: number): Promise<cc.Node> {
        return new Promise<cc.Node>((resolve, reject)=>{
            let url = "";
            if(prefabURL instanceof cc.Prefab) {
                url = prefabURL.nativeUrl;
            }
            else {
                url = prefabURL;
            }

            let info = new UIInfo();
            info.prefabURL = url;
            info.panel = null;
            info.state = UIState.WAIT;
            info.params = params;
            info.callback = resolve;
            info.zorder = (zorder === undefined) ? 0 : zorder;
            info.uiname = "";
            this._waitOpenQueue.push(info);

            this._doOpenUI();
        });
    };

    popTop() {
        let len = this._uiPanels.length;
        if(len === 0)
            return false;

        return this.popUI(this._uiPanels[len - 1].panel.node);
    }

    popUI(target: cc.Node | string) {
        let info = this.getUIInfo(target);
        if(info) {
            if(info.state == UIState.RUN && info.panel.canCloseUI()) {
                info.state = UIState.CLOSING;

                this.showShieldingLayer = true;
                this._refreshUIVisible(info);
                this._refreshViewVisible(info);
                core.sysEventEmitter.emit(CoreEvent.UI_ON_WILL_CLOSE, info.panel._uiNode);
                info.panel.close(()=>{
                    this.showShieldingLayer = false;
                    core.sysEventEmitter.emit(CoreEvent.UI_ON_CLOSE_FINISH, info.panel._uiNode);
                    this.destroyUI(info);
                });
                return true;
            }
        }
        return false;
    }

    destroyAllUI() {
        if(this._curOpenInfo) {
            this._curOpenInfo.state = UIState.DESTROYED;
            this._curOpenInfo = null;
        }
        this._waitOpenQueue.clear();

        let list:UIInfo[] = [];
        for(let i = this._uiPanels.length - 1; i >= 0; --i) {
            list.push(this._uiPanels[i]);
        }
        this._uiPanels.length = 0;

        list.forEach((info: UIInfo)=>{
            if(info.state != UIState.DESTROYED) {
                info.state = UIState.DESTROYED;
                info.panel.dismiss();
                info.panel.node.destroy();
            }
        });
    }

    destroyUI(target: UIInfo | cc.Node) {
        let info: UIInfo;
        if(target instanceof cc.Node) {
            info = this.getUIInfo(target);
            if(!info)
                return false;
        }
        else {
            info = target;
        }

        if(info.state == UIState.DESTROYED) {
            return false;
        }

        for(let i = 0; i < this._uiPanels.length; ++i) {
            if(this._uiPanels[i] == info) {
                info.state = UIState.DESTROYED;

                let panel = this._uiPanels[i].panel;
                panel.dismiss();
                panel.node.destroy();
                this._uiPanels.splice(i, 1);

                this._refreshMaskLayer();
                this._refreshUIVisible();
                this._refreshViewVisible();
                return true;
            }
        }
        return false;
    }
    

    pause() {
        this.node.active = false;
        this._pauseTag = true;
    }

    resume() {
        this.node.active = true;
        this._pauseTag = false;
        this._doOpenUI();
    }

    getUIInfo(target: cc.Node | string) : UIInfo | undefined {
        if (target instanceof cc.Node) {
            for(let i = 0, j = this._uiPanels.length; i < j; ++i) {
                if(this._uiPanels[i].panel._uiNode == target) {
                    return this._uiPanels[i];
                }
            }
        }
        else {
            for(let i = 0, j = this._uiPanels.length; i < j; ++i) {
                if(this._uiPanels[i].prefabURL == target) {
                    return this._uiPanels[i];
                }
            }
        }
    }

    ////////////////////////////////////////////////////////////// private //////////////////////////////////////////////////////////////

    private _doOpenUI() {
        if(this._pauseTag)
            return;

        this.showShieldingLayer = true;

        // 正在打开UI界面
        if(this._curOpenInfo)
            return;

        if(this._waitOpenQueue.isEmpty()) {
            this.showShieldingLayer = false;
            return;
        }

        this._curOpenInfo = this._waitOpenQueue.pop();
        this._curOpenInfo.state = UIState.LOADING;

        // 加载UI预制体
        cc.resources.load(this._curOpenInfo.prefabURL, cc.Prefab, (err, prefab: cc.Prefab)=>{
            if(!this._curOpenInfo){
                this._doOpenUI();
                return;
            }

            if(err) {
                cc.error(`加载预制体:(${this._curOpenInfo.prefabURL})失败,UI无法创建`);
                this._doOpenUI();
                return;
            }

            // 实例化UIPanel
            let panelNode = cc.instantiate(core.uiPanelPrefab);
            panelNode.zIndex = this._curOpenInfo.zorder;
            panelNode.parent = this.uiRootNode;

            // 实例化UI并将其放入UIPanel初始化
            let uiNode = cc.instantiate(prefab);

            let uipanel = panelNode.getComponent(UIPanel)
            uipanel.initUI(uiNode, this);
            uipanel._delegate.initParams = this._curOpenInfo.params;

            if(this._curOpenInfo.callback) {
                this._curOpenInfo.callback(uiNode);
            }

            this._curOpenInfo.params = undefined;
            this._curOpenInfo.callback = undefined;
            this._curOpenInfo.panel = uipanel
            this._curOpenInfo.state = UIState.OPENING;

            if(this._uiPanels.length == 0) {
                this._uiPanels.push(this._curOpenInfo);
            }
            else {
                let tailArr: UIInfo[] = [];
                for(let i = this._uiPanels.length - 1; i >= 0; --i) {
                    if(this._uiPanels[i].zorder > this._curOpenInfo.zorder) {
                        tailArr.push(this._uiPanels[i]);
                        this._uiPanels.splice(i, 1);
                    }
                    else{
                        break;
                    }
                }

                this._uiPanels.push(this._curOpenInfo);
                for(let i = tailArr.length - 1; i >= 0; --i) {
                    this._uiPanels.push(tailArr[i]);
                }
            }

            // 更新遮罩显示
            this._refreshMaskLayer();

            core.sysEventEmitter.emit(CoreEvent.UI_ON_WILL_OPEN, uiNode);
            // UI执行打开动画
            uipanel.open(()=>{
                if(this._curOpenInfo && this._curOpenInfo.state == UIState.OPENING) {
                    this._curOpenInfo.state = UIState.RUN;
                }
                this._curOpenInfo = null;
                this._refreshUIVisible();
                this._refreshViewVisible();
                core.sysEventEmitter.emit(CoreEvent.UI_ON_OPEN_FINISH, uiNode);
                // 打开任务队列中的下一个UI
                this._doOpenUI();
            });
        });
    }

    
    /**
     * 更新遮罩显示
     */
    private _refreshMaskLayer() {
        let len = this._uiPanels.length;
        if(len <= 0)
            return;
        // 保证只显示最上层UI的遮罩
        for(let i = len - 1; i >= 0; i--) {
            if(this._uiPanels[i].panel._delegate.showMaskLayer) {
                this._uiPanels[i].panel.showMask = true;
                
                for(let j = 0; j < i; ++j) {
                    this._uiPanels[j].panel.showMask = false;
                }
                break;
            }
        }
    }

    /**
     * 更新UI显示
     */
    private _refreshUIVisible(willCloseInfo?: UIInfo) {
        let len = this._uiPanels.length;
        
        let curInfo: UIInfo;

        // 隐藏全屏UI之下的其他UI
        for(let i = len - 1; i >= 0; i--) {
            curInfo = this._uiPanels[i];
            if(curInfo === willCloseInfo) {
                continue;
            }
            else {
                RenderUtil.setNodeVisible(curInfo.panel.node, true);
                if(curInfo.panel._delegate.uiType == UIType.FullScreen) {
                    for(let j = 0; j < i; ++j) {
                        curInfo = this._uiPanels[j]
                        if(curInfo !== willCloseInfo) {
                            RenderUtil.setNodeVisible(curInfo.panel.node, false);
                        }
                    }               
                    break;
                }
            }
        }
    }

    /**
     * 刷新view的显示/隐藏状态，如果显示了全屏类型的UI则隐藏下方所有的UI和view
     * @param willCloseInfo 
     */
    private _refreshViewVisible(willCloseInfo?: UIInfo) {
        let show = true;
        this._uiPanels.forEach((info: UIInfo)=>{
            if(info != willCloseInfo) {
                if(info.panel._delegate.uiType == UIType.FullScreen) {
                    show = false;
                }
            }
        });
        core.sysEventEmitter.emit(CoreEvent.UI_ON_VIEW_VISIBLE, show, this);
    }
};