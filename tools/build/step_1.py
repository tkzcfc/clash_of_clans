# encoding : utf8
import os
import utils
import config

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
