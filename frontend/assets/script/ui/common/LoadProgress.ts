import { ActionType, UIDelegate } from "../../core/ui_manager/UIDelegate";

const {ccclass, property} = cc._decorator;

@ccclass()
export class LoadProgress extends UIDelegate {
    @property(cc.Label)
    public progressLabel: cc.Label;

    @property(cc.ProgressBar)
    public progressBar: cc.ProgressBar;

    // 完成回调
    _finishCallback?: Function = undefined;
    _finishCallCtx: any = undefined;

    // 当前进度
    private _percent: number = 0;
    public get percent() : number {
        return this._percent;
    }
    public set percent(v) {
        this._percent = v;
        this.updateProgress(0);
    }
    
    protected onLoad(): void {
        this.percent = 0.0;
        this.autoDismiss = false;
        this.enableDrag = false;
        this.openActType = ActionType.NoAction;
        this.closeActType = ActionType.NoAction;
    }

    /**
     * 设置完成回调
     * @param cb 
     */
    public setFinishCallback(cb?: Function) {
        this._finishCallback = cb;
    }

    /**
     * 进度更新
     */
    private updateProgress(percent) {
        let value = percent * 100;
        this.progressLabel.string = value.toFixed(2) + "%";
        this.progressBar.progress = percent;
    }

    protected lateUpdate(dt: number): void {
        let curPercent = this.progressBar.progress;
        if(curPercent < this.percent) {
            curPercent = curPercent + dt * 4;
            curPercent = Math.min(curPercent, this.percent);
            this.updateProgress(curPercent)
        }

        if(curPercent >= 1.0 && this._finishCallback) {
            this._finishCallback();
        }
    }		
};
