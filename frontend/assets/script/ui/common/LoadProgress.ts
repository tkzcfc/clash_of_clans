import { ActionType, UIDelegate } from "../../core/ui/UIDelegate";

const {ccclass, property} = cc._decorator;

@ccclass()
export class LoadProgress extends UIDelegate {
    @property(cc.Label)
    public progressLabel: cc.Label;

    @property(cc.ProgressBar)
    public progressBar: cc.ProgressBar;

    // 完成回调
    private _finishCallback?: Function = undefined;
    // 是否完成
    private _isFinish = false;

    // 进度显示文本前缀
    public progressPrefix: string = "";

    
    public isFinish() {
        return this._isFinish;
    }

    // 当前进度
    private _percent: number = 0;
    public get percent() : number {
        return this._percent;
    }
    
    protected onLoad(): void {
        this._percent = 0.0;
        this.autoDismiss = false;
        this.enableDrag = false;
        this.openActType = ActionType.NoAction;
        this.closeActType = ActionType.NoAction;
        this.progressBar.progress = 0;

        this.updateProgress(0, false);
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
    public updateProgress(percent, isFinish = false) {
        if(isFinish) {
            percent = 1;
        }
        if(!this._isFinish) {
            this._isFinish = isFinish;
        }

        // 进度文本更新
        let value = percent * 100;
        if(this.progressPrefix === "") {
            this.progressLabel.string = value.toFixed(1) + "%";
        }
        else {
            this.progressLabel.string = this.progressPrefix + "(" + value.toFixed(1) + "%)";
        }
        
        // 进度保存
        if(percent <= this._percent) {
            this.progressBar.progress = percent;
        }
        this._percent = percent;
    }

    protected lateUpdate(dt: number): void {
        let curPercent = this.progressBar.progress;
        if(curPercent < this._percent) {
            curPercent = curPercent + dt * 4;
            curPercent = Math.min(curPercent, this._percent);
            this.progressBar.progress = curPercent;
        }

        if(curPercent >= 1.0 && this._isFinish) {
            this._isFinish = false;
            this._finishCallback && this._finishCallback();
            this._finishCallback = undefined;
        }
    }		
};
