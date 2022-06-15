import { core } from "../../core/InitCore";
import { UIDelegate } from "../../core/ui_manager/UIDelegate";

const {ccclass, property} = cc._decorator;

@ccclass()
export class Launch extends UIDelegate {
    _timeFinish: boolean = false;
    _isLoadFinish: boolean = false;
    _changeToURL = "prefab/ui/login/login";

    protected start(): void {
        cc.resources.load(this._changeToURL, cc.Prefab, (err, prefab: cc.Prefab)=>{
            this._isLoadFinish = true;
            this.change();
        })

        setTimeout(()=> {
            this._timeFinish = true;
            this.change();
        }, 1000);
    }

    change() {
        if(this._isLoadFinish && this._timeFinish) {
            core.ui.current().pushUI(this._changeToURL);
            core.ui.current().destroyUI(this.node);
        }
    }
    
    /** UI即将关闭 
     * @returns 返回false则表示中断此次关闭
    */
     public onUIWillClose(): boolean {
        return false;
    }
};
