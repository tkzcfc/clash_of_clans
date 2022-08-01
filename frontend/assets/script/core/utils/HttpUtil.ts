/*
 * Created: 2022-07-20 18:45:40
 * Author : fc
 * Description: 
 */


interface TaskInfo {
    onProgress: (totalBytesReceived: number, totalBytesExpected: number) => void,
    onComplete: (ok : boolean, result: any)=>void
}

export module HttpUtil {
    let downloader: jsb.Downloader;
    let tashUniqueId = 0;
    let taskMap = new Map<string, TaskInfo>();

    
    /**
     * 文件下载
     * @param url 
     * @param storagePath 
     * @param onProgress 
     * @param onComplete 
     * @returns 
     */
     export function fetch(url: string, storagePath: string, onComplete: (ok : boolean, result: string)=>void, onProgress?: (totalBytesReceived: number, totalBytesExpected: number) => void){
        initialize();
        tashUniqueId++;

        let identifier = newIdentifier();
        taskMap.set(identifier, {
            onProgress : onProgress,
            onComplete: onComplete,
        })
        downloader.createDownloadFileTask(url, storagePath, identifier);
        return identifier;
    }
    
    export function read(url: string, onComplete: (ok : boolean, result: any)=>void, onProgress?: (totalBytesReceived: number, totalBytesExpected: number) => void, options?: any) {
        let identifier = newIdentifier();
        taskMap.set(identifier, {
            onProgress : onProgress,
            onComplete: onComplete,
        })

        let xhr = new XMLHttpRequest(), errInfo = 'download failed: ' + url + ', status: ';

        xhr.open('GET', url, true);

        if(options) {
            if (options.responseType !== undefined) xhr.responseType = options.responseType;
            if (options.withCredentials !== undefined) xhr.withCredentials = options.withCredentials;
            if (options.mimeType !== undefined && xhr.overrideMimeType ) xhr.overrideMimeType(options.mimeType);
            if (options.timeout !== undefined) xhr.timeout = options.timeout;

            if (options.header) {
                for (var header in options.header) {
                    xhr.setRequestHeader(header, options.header[header]);
                }
            }
        }

        xhr.onload = function () {
            let taskInfo = taskMap.get(identifier);
            if(!taskInfo) {
                return;
            }

            if ( xhr.status === 200 || xhr.status === 0 ) {
                taskInfo.onComplete && taskInfo.onComplete(true, xhr.response);
            } else {
                taskInfo.onComplete && taskInfo.onComplete(false, errInfo + xhr.status + '(no response)');
            }
        };

        if (onProgress) {
            xhr.onprogress = function (e) {
                if (e.lengthComputable) {
                    let taskInfo = taskMap.get(identifier);
                    if(!taskInfo) {
                        return;
                    }

                    taskInfo.onProgress(e.loaded, e.total);
                }
            };
        }

        xhr.onerror = function(){
            let taskInfo = taskMap.get(identifier);
            if(!taskInfo) {
                return;
            }
            
            taskInfo.onComplete && taskInfo.onComplete(false, errInfo + xhr.status + '(error)');
        };

        xhr.ontimeout = function(){
            let taskInfo = taskMap.get(identifier);
            if(!taskInfo) {
                return;
            }
            
            taskInfo.onComplete && taskInfo.onComplete(false, errInfo + xhr.status + '(time out)');
        };

        xhr.onabort = function(){
            let taskInfo = taskMap.get(identifier);
            if(!taskInfo) {
                return;
            }
            
            taskInfo.onComplete && taskInfo.onComplete(false, errInfo + xhr.status + '(abort)');
        };

        xhr.send(null);

        return identifier;
    }
    
    export function cancel(identifier) {
        taskMap.delete(identifier);
    }

    //////////////////////////////////////// private ////////////////////////////////////////

    function initialize() {
        if(downloader) {
            return;
        }

        downloader = new jsb.Downloader();
        
        downloader.setOnTaskProgress((task: jsb.DownloaderTask, bytesReceived: number, totalBytesReceived: number, totalBytesExpected: number)=>{
            let taskInfo = taskMap.get(task.identifier);
            if(!taskInfo) {
                return;
            }

            taskInfo.onProgress && taskInfo.onProgress(totalBytesReceived, totalBytesExpected);
        });

        downloader.setOnTaskError((task: jsb.DownloaderTask, errorCode: number, errorCodeInternal: number, errorStr: string)=>{
            let taskInfo = taskMap.get(task.identifier);
            if(!taskInfo) {
                return;
            }
            
            taskInfo.onComplete && taskInfo.onComplete(false, errorStr);
            
            taskMap.delete(task.identifier);
        });

        downloader.setOnFileTaskSuccess((task: jsb.DownloaderTask)=>{
            let taskInfo = taskMap.get(task.identifier);
            if(!taskInfo) {
                return;
            }

            taskInfo.onComplete && taskInfo.onComplete(true, task.storagePath);

            taskMap.delete(task.identifier);         
        });
    }

    function newIdentifier() : string {
        tashUniqueId++;
        return `task_{${tashUniqueId}}`;
    }
}

