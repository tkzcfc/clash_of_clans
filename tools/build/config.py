# encoding : utf8

import utils
import os

def initWithFile(cfgfile):
    global data
    global ignoreFiles

    data = utils.readJsonFromFile(cfgfile)
    if not data:
        utils.error("Failed to read the file '{0}'".format(cfgfile))
        return False


    data["root_dir"]            = os.path.abspath(data["root_dir"])
    data["project_dir"]         = os.path.abspath(data["project_dir"])
    data["hotfix_out_dir"]      = os.path.abspath(data["hotfix_out_dir"])
    data["hotfix_archives_dir"] = os.path.abspath(data["hotfix_archives_dir"])

    if not data["asset_out_dir"] == "":
        data["asset_out_dir"]         = os.path.abspath(data["asset_out_dir"])

    data["key_store"]           = os.path.abspath(data["key_store"])


    # 计算需要忽略的文件列表
    ignoreFiles = utils.getFilesByCfgList(getRootDir(), data.get("ignores", []))

    print("============================================")
    print("stronger_ver         :" + str(data["stronger_ver"]))
    print("root_dir             :" + data["root_dir"])
    print("project_dir          :" + data["project_dir"])
    print("hotfix_out_dir       :" + data["hotfix_out_dir"])
    print("hotfix_archives_dir  :" + data["hotfix_archives_dir"])
    print("asset_out_dir        :" + data["asset_out_dir"])

    for file in ignoreFiles:
        print("ignore           :" + file)
    print("============================================")

    return True


def isEnableEncrypt():
    return data.get("enable_encrypt", False)

# 获取项目路径
def getProjectDir():
    return data["project_dir"]

# 获取项目根目录(构建后的项目目录)
def getRootDir():
    return data["root_dir"]

# 获取热更工具存档目录
def getArchivesDir():
    return data["hotfix_archives_dir"]

# 获取热更文件输出目录
def getHotfixOutDir():
    return data["hotfix_out_dir"]


# 获取creator exe路径
def getCreatorExe():
    return data["creator_exe"]

# 获取构建参数
def getBuildParams():
    return data["build_params"]

# 是否忽略该文件
def isIgnore(fileName):
    for name in ignoreFiles:
        if utils.equalFile(fileName, name):
            return True
    return False

# 获取热更文件列表
def getHotfixFileList():
    return data["files"]

# 获取当前强更版本
def getStrongerVer():
    return data["stronger_ver"]

# 获取资源加密处理后的输出目录
def getAssetOutDir():
    return data["asset_out_dir"]



##################### android签名相关 #####################
def getKeyAlias():
    return data["key_alias"]

def getKeyPassword():
    return data["key_password"]

def getKeyStorePwd():
    return data["key_store_pwd"]

def getKeyStore():
    return data["key_store"]

def getAndroidSdkBuildTools():
    return data["android_sdk_build_tools"]

def getAndroidAppOutputPath():
    return data["android_app_output_path"]
