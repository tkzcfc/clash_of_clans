import { core } from "../../../core/InitCore";
import { UIDelegate } from "../../../core/ui_manager/UIDelegate";

const {ccclass, property} = cc._decorator;

@ccclass()
export class MessageBox extends UIDelegate {

    @property(cc.Button)
    public btn_cancel : cc.Button;
    
    @property(cc.Button)
    public btn_ok: cc.Button;

    @property(cc.Label)
    public textLabel: cc.Label;


    private _onClickOKCallback: Function;
    private _onClickCancelCallback: Function;

    showOne(str: string, call ?: Function) {
        this.textLabel.string = str;
        this._onClickOKCallback = call;
        this.btn_ok.getComponent(cc.Widget).isAlignHorizontalCenter = true;
        this.btn_cancel.node.active = false;
    }

    showTwo(str: string, call1?: Function, call2 ?: Function) {
        this.textLabel.string = str;
        this._onClickOKCallback = call1;
        this._onClickCancelCallback = call2;
    }

    onClickOK() {
        if(this._onClickOKCallback) {
            this._onClickOKCallback();
        }
        this.closeSelf();
    }

    onClickCancel() {
        if(this._onClickCancelCallback) {
            this._onClickCancelCallback();
        }
        this.closeSelf();
    }
};
