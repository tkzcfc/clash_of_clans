import { HttpUtil } from "./HttpUtil";


export enum UpdateStatus {
    NONE            = 0,  // 无

    // checkUpdate 函数调用会跳转的状态
    CHECKING        = 1,  // 更新检查中...
    CHECK_FINISH    = 2,  // 更新检查完成

    // startUpdate 函数调用会跳转的状态
    DOWNLOADING     = 3,  // 资源下载中...
    DECOMPRESSING   = 4,  // 资源解压中...
    UPDATE_COMPLETE = 5,  // 更新完成
}

export enum UpdateCode {
    // checkUpdate 函数错误码
    ERROR_NO_BUILTIN_MANIFEST = 0,  // 找不到本地的清单文件
    ERROR_DOWNLOAD_MANIFEST   = 1,  // 远程清单文件下载失败
    ERROR_PARSE_MANIFEST      = 2,  // 清单文件解析失败
    NEED_STRONG_UPDATE        = 3,  // 需要强更新
    NEW_VERSION_FOUND         = 4,  // 发现新版本
    ALREADY_UP_TO_DATE        = 5,  // 已经是最新版本了

    // startUpdate 函数错误码
    ERROR_DECOMPRESS          = 6,  // 资源解压失败
    ERROR_DOWNLOAD            = 7,  // 资源下载失败
    ERROR_VERIF               = 8,  // 资源校验失败
    SUCCESS                   = 9,  // 更新成功
}


const CacheManifestName = "cache.manifest"

export class Updater {
    // 更新存储目录
    private storagePath: string;
    // 临时存储目录
    private tempStoragePath: string;
    // 当前更新状态
    private curStatus = UpdateStatus.NONE;

    // 内置清单文件
    private builtinManifestFile: string;
    // 内置清单文件 JSON数据
    private builtinData: any;

    // 缓存清单文件
    private cacheManifestFile: string;

    
    // 远程单文件 JSON数据
    private remoteData: any;

    // 需要更新下载的文件信息
    private needDownloadInfo: any;

    /**
     * 
     * @param manifestFile 清单文件
     * @param storageDirName 更新本地存储目录名称
     */
    constructor(manifestFile: string, storageDirName: string) {
        this.builtinManifestFile = manifestFile

        let writablePath = jsb.fileUtils.getWritablePath()

        this.storagePath = writablePath + storageDirName
        jsb.fileUtils.createDirectory(this.storagePath)
    
        this.tempStoragePath = writablePath + storageDirName + "_tmp"
        jsb.fileUtils.createDirectory(this.tempStoragePath)
    
        this.cacheManifestFile = writablePath + CacheManifestName
    }

    /**
     * 检查更新
     * @param resultCall 结果回调 
     */
    checkUpdate(resultCall: (result: boolean, code: UpdateCode)=>void) {
        console.assert(this.curStatus == UpdateStatus.NONE);

        if(!jsb.fileUtils.isFileExist(this.builtinManifestFile)) {
            resultCall(false, UpdateCode.ERROR_NO_BUILTIN_MANIFEST);
            return;
        }

        // 内置清单数据
        this.builtinData = jsonDecode(jsb.fileUtils.getStringFromFile(this.builtinManifestFile));
        if (!this.builtinData) {
            resultCall(false, UpdateCode.ERROR_PARSE_MANIFEST);
            return;
        }

        // 缓存的清单数据
        let cacheData = undefined;
        if (jsb.fileUtils.isFileExist(this.cacheManifestFile)){
            cacheData = jsonDecode(jsb.fileUtils.getStringFromFile(this.cacheManifestFile));
            if (!cacheData) {
                jsb.fileUtils.removeFile(this.cacheManifestFile);
            }
        }

        // 如果有缓存的清单数据
        if(cacheData) {
            this.initDataVar(cacheData);
            this.initDataVar(this.builtinData);

            log(`builtin stronger_ver: ${this.builtinData["stronger_ver"]}`);
            log(`cache stronger_ver: ${cacheData["stronger_ver"]}`);

            if (cacheData["stronger_ver"] === this.builtinData["stronger_ver"]) {
                // 缓存的强更版本与包内的版本相同, 使用缓存的清单数据
                this.builtinData = cacheData;
            }
            else {
                // 清空所有的更新数据
                this.repair();
                cacheData = undefined;
            }
        }

        this.curStatus = UpdateStatus.CHECKING;

        log(`http fetch:${this.builtinData["remote_manifest_url"]}`)
        HttpUtil.read(this.builtinData["remote_manifest_url"], (ok, result) => {
            if(!ok) {
                resultCall(false, UpdateCode.ERROR_DOWNLOAD_MANIFEST);
                return;
            }
            
            this.remoteData = jsonDecode(result);

            //  远程清单数据解析失败
            if(!this.remoteData) {
                resultCall(false, UpdateCode.ERROR_PARSE_MANIFEST);
                this.curStatus = UpdateStatus.NONE;
                return;
            }

            this.curStatus = UpdateStatus.CHECK_FINISH;

            this.initDataVar(this.builtinData);
            this.initDataVar(this.remoteData);

            log(`builtin stronger_ver: ${this.builtinData["stronger_ver"]}`);
            log(`remote stronger_ver: ${this.remoteData["stronger_ver"]}`);
            log(`builtin hotfix_ver: ${this.builtinData["hotfix_ver"]}`);
            log(`remote hotfix_ver: ${this.remoteData["hotfix_ver"]}`);

            //  需要强更新
            if (this.isNeedStrongUpdate()) {
                resultCall(true, UpdateCode.NEED_STRONG_UPDATE);
            }
            else {
                if(this.isNeedHotFix()) {
                    let fileInfo = this.getUpdateFileInfo();
                    if(!fileInfo) {
                        // 将远程清单文件写入到本地
                        jsb.fileUtils.writeStringToFile(JSON.stringify(this.remoteData), this.cacheManifestFile);
                        //  无需下载,此版本升级到最新版没有新增任何文件
                        resultCall(true, UpdateCode.ALREADY_UP_TO_DATE);
                    }
                    else {
                        this.needDownloadInfo = fileInfo;
                        //  发现新版本,需要更新
                        resultCall(true, UpdateCode.NEW_VERSION_FOUND);
                    }
                }
                else {
                    resultCall(true, UpdateCode.ALREADY_UP_TO_DATE);
                }
            }
        });
    }

    /**
     * 开始更新
     */
     startUpdate(resultCall: (code: UpdateCode) => void, percentCall: (current: number, total: number) => void) {
        console.assert(this.curStatus == UpdateStatus.CHECK_FINISH)
        console.assert(this.needDownloadInfo)
    
        this.curStatus = UpdateStatus.DOWNLOADING
    
        let url = this.remoteData["package_url"] + "/" + this.needDownloadInfo.name
        let saveto = this.tempStoragePath + "/" + this.needDownloadInfo.name
    
        // 进度更新
        let percent = function(now, total) {
            if(total <= 0) {
                total = this.needDownloadInfo.bytes;
            }
            percentCall(now, total);
        }
        log(`http fetch:${url}`)
        HttpUtil.fetch(url, saveto, (ok, file) =>{
            if(ok) {
                // 文件校验
                if(this.verifyFile(file)) {
                    // 解压资源
                    this.decompressResources(file, resultCall, percentCall)
                }
                else {
                    // 资源校验失败,删除对应资源
                    this.curStatus = UpdateStatus.CHECK_FINISH
                    jsb.fileUtils.removeFile(file)
                    resultCall(UpdateCode.ERROR_VERIF)
                }
            }
            else {
                // 文件下载失败
                this.curStatus = UpdateStatus.CHECK_FINISH;
                resultCall(UpdateCode.ERROR_DOWNLOAD);
            }
        }, percent);
     }

    /**
     * 清理更新的所有文件
     */
    repair() {
        log("do repair");
        jsb.fileUtils.removeFile(this.cacheManifestFile)
        jsb.fileUtils.removeDirectory(this.storagePath)
        jsb.fileUtils.removeDirectory(this.tempStoragePath)

        jsb.fileUtils.createDirectory(this.storagePath)
        jsb.fileUtils.createDirectory(this.tempStoragePath)
    }

    /**
     * 获取当前状态
     */
    getCurStatus() {
        return this.curStatus;
    }

    /**
     * 获取此次更新需要下载的文件大小
     */
     getNeedDownloadBytes(): number {
        return this.needDownloadInfo["bytes"];
     }

    /////////////////////////////////////////////////////////////////////////////////////

    /**
     * 文件校验
     * @param filename 
     * @returns 
     */
    private verifyFile(filename) {
        // 此处只校验下文件大小
        let fileSize = jsb.fileUtils.getFileSize(filename);
        let remoteSize = this.needDownloadInfo.bytes;

        if(Math.abs(fileSize - remoteSize) < 1000) {
            return true;
        }
        
        return false;
    }
    
    private isNeedStrongUpdate() {
        return this.builtinData["stronger_ver"] < this.remoteData["stronger_ver"]
    }

    private isNeedHotFix() {
        return this.builtinData["hotfix_ver"] < this.remoteData["hotfix_ver"]
    }

    private initDataVar(data) {
        let str = data["version"];
        let pattern = /(\d+)_(\d+)/;

        if(!pattern.test(str)) {
            data["stronger_ver"] = 0;
            data["hotfix_ver"] = 0;
            return;
        }

        let params = pattern.exec(str)
        data["stronger_ver"] = parseInt(params[1]);
        data["hotfix_ver"] = parseInt(params[2]);
    }

    private getUpdateFileInfo() {
        let from = this.builtinData.version;
        let to   = this.remoteData.version;
        let file = `${from}_to_${to}.zip`;

        let files = this.remoteData["files"];
        for(let i = 0, j = files.length; i < j; ++i) {
            if(files[i].name == file) {
                return files[i];
            }
        }
    }

    /**
     * 资源解压
     * @param zipFile 
     * @param resultCall 
     * @param percentCall 
     */
    private decompressResources(zipFile, resultCall: (code: UpdateCode) => void, percentCall: (current: number, total: number) => void) {
        log("decompressResources...")
        this.curStatus = UpdateStatus.DECOMPRESSING;
        // @ts-ignore
        ccex.ZipUtil.decompressZipAsync(zipFile, this.storagePath, true, (ok, err)=>{
            if(ok) {
                // 解压成功,将临时目录的资源拷贝到更新目录中去
                // 此处直接解压到目标目录中，不需要在拷贝了
                // ccex.ZipUtil.decompressZipAsync(zipFile, "", .... 时才需要拷贝
                // this.copyResource()
                
                jsb.fileUtils.removeDirectory(this.tempStoragePath);
                jsb.fileUtils.createDirectory(this.tempStoragePath);

                // 将远程清单文件写入到本地
                jsb.fileUtils.writeStringToFile(JSON.stringify(this.remoteData), this.cacheManifestFile);
                
                this.curStatus = UpdateStatus.UPDATE_COMPLETE
                resultCall(UpdateCode.SUCCESS)
            }
            else {
                // 资源解压失败,删除对应资源
                this.curStatus = UpdateStatus.CHECK_FINISH;
                jsb.fileUtils.removeFile(zipFile);
                resultCall(UpdateCode.ERROR_DECOMPRESS);
            }
        }, percentCall);
    }

    /**
     * 将 this.tempStoragePath 目录的资源拷贝到 this.storagePath 中去
     */
    private copyResource() {
        log("copyResource...")
        let fileList: string[] = [];
        jsb.fileUtils.listFilesRecursively(this.tempStoragePath, fileList);

        for(let i = 0, j = fileList.length; i < j; ++i) {
            let oldFileName = fileList[i];

            if(jsb.fileUtils.isFileExist(oldFileName)) {
                let newFileName = this.storagePath + oldFileName.substring(this.tempStoragePath.length);
                
                // 创建对应目录结构
                let dirName = jsb.fileUtils.getFileDir(newFileName);
                if(!jsb.fileUtils.isDirectoryExist(dirName)) {
                    jsb.fileUtils.createDirectory(dirName);
                }
                // @ts-ignore
                if(!jsb.fileUtils.renameFile(oldFileName, newFileName)) {
                    // @ts-ignore
                    let binary = jsb.fileUtils.getDataFromFile(oldFileName);
                    // @ts-ignore
                    jsb.fileUtils.writeDataToFile(binary, newFileName);
                }
            }
        }
    }
}


function jsonDecode(content){
    try {
        return JSON.parse(content);
    } catch (error) {
    	return undefined;
    }
}

function log(str) {
    cc.log("[Updater]:  " + str)
}