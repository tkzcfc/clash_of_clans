# encoding : utf8
import os
import utils
import config


injectScript = '''
(function () {
    if (typeof window.jsb === 'object') {
        var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
        if (hotUpdateSearchPaths) {
            var paths = JSON.parse(hotUpdateSearchPaths);
            jsb.fileUtils.setSearchPaths(paths);

            var fileList = [];
            var storagePath = paths[0] || '';
            var tempPath = storagePath + '_temp/';
            var baseOffset = tempPath.length;

            if (jsb.fileUtils.isDirectoryExist(tempPath) && !jsb.fileUtils.isFileExist(tempPath + 'project.manifest.temp')) {
                jsb.fileUtils.listFilesRecursively(tempPath, fileList);
                fileList.forEach(srcPath => {
                    var relativePath = srcPath.substr(baseOffset);
                    var dstPath = storagePath + relativePath;

                    if (srcPath[srcPath.length] == '/') {
                        jsb.fileUtils.createDirectory(dstPath)
                    }
                    else {
                        if (jsb.fileUtils.isFileExist(dstPath)) {
                            jsb.fileUtils.removeFile(dstPath)
                        }
                        jsb.fileUtils.renameFile(srcPath, dstPath);
                    }
                })
                jsb.fileUtils.removeDirectory(tempPath);
            }
        }
    }
})();
'''

# 构建工程
def main():
    # @Ref http://docs.cocos.com/creator/3.0/manual/zh/editor/publish/publish-in-command-line.html
    # 332 构建失败 —— 构建参数不合法
    # 334 构建失败 —— 构建过程出错失败，详情请参考构建日志
    cmd = "%s --path \"%s\" --build \"%s\"" % (config.getCreatorExe(), config.getProjectDir(), config.getBuildParams())
    code = utils.runCmd(cmd)
    if code == 332:
        utils.error("invalid build parameter")
    elif code == 334:
        utils.error("build failed")
    else:
        print("build success")

    fileMainJs = utils.joinPath(config.getRootDir(), "main.js")
    data = utils.readDataFromFile(fileMainJs)
    utils.writeDataToFile(fileMainJs, injectScript + data)
