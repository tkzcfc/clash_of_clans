# encoding : utf8
import os
import utils
import config


injectScript = '''
(function () {
    if (typeof window.jsb === 'object') {
        jsb.fileUtils.purgeCachedEntries();

        var searchPaths = jsb.fileUtils.getSearchPaths();

        let writablePath = jsb.fileUtils.getWritablePath() + "hotfix/"
        searchPaths.unshift(writablePath);

        for (var i = 0; i < searchPaths.length; i++) {
            searchPaths[i] = searchPaths[i].replace(/\\\\/g, "/")
        }
        // delete duplicate paths
        var newSearchPaths = searchPaths.filter(function(value,index,self){
            return self.indexOf(value) === index;
        });

        jsb.fileUtils.setSearchPaths(newSearchPaths);
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
