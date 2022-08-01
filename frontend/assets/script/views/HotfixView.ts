/*
 * Created: 2022-07-20 16:25:20
 * Author : fc
 * Description: 热更场景
 */



import { Const } from "../common/Const";
import { CoreEvent } from "../core/common/event/CoreEvent";
import { core } from "../core/InitCore";
import { UpdateCode, Updater, UpdateStatus } from "../core/utils/Updater";
import { View } from "../core/view_manager/View";
import { LoadProgress } from "../ui/common/LoadProgress";
import { UIUtils } from "../ui/UIUtils";

const {ccclass, property} = cc._decorator;

function fmtBytes(bytes: number) {
    let suffix = "bytes";
    if(bytes >= 1024 * 1024 * 1024) {
        bytes /= 1024;
        bytes /= 1024;
        bytes /= 1024;
        suffix = "GB";
    }
    else if(bytes >= 1024 * 1024) {
        bytes /= 1024;
        bytes /= 1024;
        suffix = "MB";
    }
    else if(bytes >= 1024) {
        bytes /= 1024;
        suffix = "KB";                            
    }

    return `${bytes.toFixed(2)}${suffix}`;
}

@ccclass()
export default class HotfixView extends View {
    private progress: LoadProgress;
    private updater: Updater = new Updater("assets/manifest.json", "hotfix");

    protected start(): void {
        core.ui.current().pushUI(Const.UIs.LoadProgress).then(node=>{
            this.progress = node.getComponent(LoadProgress);
            this.progress.progressPrefix = "版本检测中";
            this.startCheckUpdate();
        });
    }

    protected startCheckUpdate() {
        this.updater.checkUpdate((result, code)=>{
            if(result) {
                switch (code) {
                    // 需要强更新
                    case UpdateCode.NEED_STRONG_UPDATE:
                    {
                        UIUtils.showMsgBoxOne(`请从应用市场下载最新版本`, ()=>{
                            cc.game.end();
                        });
                    }           
                    break;
                    // 发现新版本
                    case UpdateCode.NEW_VERSION_FOUND:
                    {
                        let bytes = this.updater.getNeedDownloadBytes();
                        UIUtils.showMsgBoxTwo(`此次更新需要下载${fmtBytes(bytes)}文件，是否继续?`, ()=>{}, ()=>{
                            cc.game.end();
                        }).then(node=>{
                            node.once(CoreEvent.UI_ON_CLOSE_FINISH, ()=>{
                                this.startUpdate();
                            });
                        });
                    }            
                    break;
                    // 已经是最新版本了
                    case UpdateCode.ALREADY_UP_TO_DATE:
                    {
                        this.progress.setFinishCallback(()=>{
                            core.viewManager.runEmptyView(View);
                            core.ui.current().pushUI(Const.UIs.Login);
                        });
                        this.progress.updateProgress(1.0, true);
                    }                        
                    break;                
                    default:
                        break;
                }
            }
            else {
                UIUtils.showMsgBoxTwo(`版本检测失败,错误码(${code}),是否重试?`, ()=>{
                    this.startCheckUpdate();
                }, ()=>{
                    cc.game.end();
                });
            }         
        });        
    }

    protected startUpdate() {
        // 更新完毕后重启客户端
        this.progress.setFinishCallback(()=>{
            setInterval(()=>{
                cc.audioEngine.stopAll();
                cc.game.restart();
            }, 0.1);
        });

        this.updater.startUpdate((code: UpdateCode) => {
            // ERROR_DECOMPRESS          = 6,  // 资源解压失败
            // ERROR_DOWNLOAD            = 7,  // 资源下载失败
            // ERROR_VERIF               = 8,  // 资源校验失败
            // SUCCESS                   = 9,  // 更新成功
            if(code == UpdateCode.ERROR_DECOMPRESS) {
                UIUtils.showMsgBoxTwo(`更新失败:资源解压失败,是否重试?`, ()=>{
                    this.startUpdate();
                }, ()=>{
                    cc.game.end();
                });
            }
            else if(code == UpdateCode.ERROR_DOWNLOAD) {
                UIUtils.showMsgBoxTwo(`更新失败:资源下载失败,是否重试?`, ()=>{
                    this.startUpdate();
                }, ()=>{
                    cc.game.end();
                });
            }
            else if(code == UpdateCode.ERROR_VERIF) {
                UIUtils.showMsgBoxTwo(`更新失败:资源校验失败,是否重试?`, ()=>{
                    this.startUpdate();
                }, ()=>{
                    cc.game.end();
                });
            }
            else if(code == UpdateCode.SUCCESS) {
                this.progress.updateProgress(1.0, true);
            }
            else {
                console.assert(false);
            }
        }, (current: number, total: number) => {
            if(this.progress.isFinish()) {
                return;
            }

            if(this.updater.getCurStatus() === UpdateStatus.DOWNLOADING) {
                this.progress.progressPrefix = `${fmtBytes(current)}/${fmtBytes(total)}`;
            }
            else if(this.updater.getCurStatus() === UpdateStatus.DECOMPRESSING) {
                this.progress.progressPrefix = `资源解压`;
            }
            else {
                this.progress.progressPrefix = "";                
            }

            if(total <= 0) {
                this.progress.updateProgress(1);
            }
            else {
                this.progress.updateProgress(current / total);
            }            
        });
    }
}
