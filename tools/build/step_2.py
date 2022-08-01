# encoding : utf8
import os
import utils
import sys
import config
import json
import time

hotfixDirPrefix = "version_"
manifestFileName = "manifest.json"
hotfixFileName = "hotfix.json"


# 获取需要处理的文件列表
def getFiles(rootDir):
    files = utils.getFilesByCfgList(rootDir, config.getHotfixFileList())
    outList = []

    for file in files:
        if not config.isIgnore(file):
            outList.append(file)

    return outList


def makeManifest(rootDir):
    files = []
    utils.walkFiles(rootDir, "", True, files)

    # 清单文件列表
    manifestFiles = []

    count = 0
    for file in files:
        count = count + 1
        # 文件相对路径
        key = file[len(rootDir):]
        key = key.replace("\\", "/")
        key = key.strip("/")
        
        # 文件内容md5值
        strMd5 = utils.md5File(file)

        manifestFiles.append({
            "name": key,
            "md5": strMd5,
            "bytes": utils.fileSize(file)
        })
        utils.showProgress(count / len(files), "build manifest")
    utils.showProgressFinish()


    # 所有文件的md5值
    allFileMd5Str = ""

    manifestFiles.sort(key = lambda x: x["name"])
    for info in manifestFiles:
        allFileMd5Str = allFileMd5Str + info["md5"]

    manifest = {
        "files": manifestFiles,
        "md5": utils.md5Str(allFileMd5Str),
    }

    return manifest



def equalFileInManifest(manifest, info):
    for v in manifest.get("files", []):
        if v["name"] == info["name"]:
            return v["md5"] == info["md5"] and v["bytes"] == info["bytes"]
    return False

# 获取差异资源列表
def getDifferenceFiles(oldManifest, newManifest):
    files = []

    for v in newManifest.get("files", []):
        if not equalFileInManifest(oldManifest, v):
            files.append(v["name"])

    return files


# 获取差异文件夹名称
def getDifferenceDirName(oldManifest, newManifest):
    return "{0}_to_{1}".format(oldManifest["version"], newManifest["version"])




def main():
    # 临时缓存目录
    cacheDir = utils.joinPath(os.path.dirname(os.path.realpath(__file__)), "step_2_cache/")
    # 热更文件输出目录
    outHotfixZipDir = config.getHotfixOutDir()
    # 根目录
    rootDir = config.getRootDir()

    # 1. 清空目录
    utils.removeFile(cacheDir)
    utils.removeFile(outHotfixZipDir)


    # 2. 获取需要处理的文件列表
    files = getFiles(rootDir)

    # 3. 文件处理
    count = 0
    for file in files:
        # 文件相对路径
        relativeFileName = file[len(rootDir):]

        # 文件处理...
        # 这儿没有任何处理，直接拷贝
        utils.copyFile(file, utils.joinPath(cacheDir, relativeFileName))

        # 进度显示
        count = count + 1
        utils.showProgress(count / len(files), "encrypt file")
    utils.showProgressFinish()

    # 4. 生成清单文件
    manifest = makeManifest(cacheDir)

    difference = []
    curVerDir = utils.joinPath(config.getArchivesDir(), "v_" + str(config.getStrongerVer()))

    # 5. 获取当前主版本下的所有子版本清单文件
    maxVer = -1
    if os.path.isdir(curVerDir):
        for file in os.listdir(curVerDir):
            fullPath = utils.joinPath(curVerDir, file)
            if file.startswith(hotfixDirPrefix) and os.path.isdir(fullPath):
                ver = file[len(hotfixDirPrefix):]
                if utils.isInt(ver):
                    ver = int(ver)

                    if ver > maxVer:
                        maxVer = ver

                    manifestFileFullName = utils.joinPath(fullPath, manifestFileName)
                    data = utils.readJsonFromFile(manifestFileFullName)
                    data["ver"] = ver
                    difference.append(data)

    # 6. 计算当前版本号
    curVer = 0
    for i in range(0, len(difference)):
        if difference[i]["ver"] == maxVer:
            if len(getDifferenceFiles(difference[i], manifest)) == 0:
                curVer = maxVer
                difference.pop(i)
            else:
                curVer = maxVer + 1
            break

    manifest["version"] = "{0}_{1}".format(config.getStrongerVer(), curVer)


    # 7. 输出差异压缩包
    zipList = []
    for i in range(0, len(difference)):
        diffFileList = getDifferenceFiles(difference[i], manifest)

        # 这两个版本之间没有任何文件差异,仅仅是版本号不同
        if len(diffFileList) == 0:
            v1 = difference[i]["version"]
            v2 = manifest["version"]
            print("There is no difference between version {0} and version {1}, skipping [{2}/{3}]".format(v1, v2, i + 1, len(difference)))
        else:
            diffDir = utils.joinPath(outHotfixZipDir, getDifferenceDirName(difference[i], manifest))
            for file in diffFileList:
                fromfile = utils.joinPath(cacheDir, file)
                tofile = utils.joinPath(diffDir, file)
                utils.copyFile(fromfile, tofile)

            zipfile = diffDir + ".zip"
            utils.zipDir(zipfile, [diffDir], diffDir, True)
            utils.removeFile(diffDir)

            zipList.append(zipfile)

            print("Generate variance package: {0} [{1}/{2}]".format(zipfile, i + 1, len(difference)))

    # 8. 热更差异文件清单
    hotfixManifest = {
        "version": manifest["version"],
        "remote_manifest_url": config.getRemoteManifestUrl(),
        "package_url": config.getPackageUrl(),
        "files":[]
    }
    for zipFile in zipList:
        hotfixManifest["files"].append({
            "name": zipFile[len(outHotfixZipDir):].lstrip("/\\"),
            "bytes": utils.fileSize(zipFile),
            "md5": utils.md5File(zipFile)
            })

    utils.writeDataToFile(utils.joinPath(outHotfixZipDir, hotfixFileName), json.dumps(hotfixManifest, indent = 4))

    # 9. 清单文件存档
    manifestStr = json.dumps(manifest, indent = 4)
    toDirName = utils.joinPath(curVerDir, hotfixDirPrefix + str(curVer))
    utils.writeDataToFile(utils.joinPath(toDirName, manifestFileName), manifestStr)

    hotfixManifest.pop("files")
    manifestStr = json.dumps(hotfixManifest, indent = 4)
    toDirName = utils.joinPath(cacheDir, "assets")
    utils.writeDataToFile(utils.joinPath(toDirName, manifestFileName), manifestStr)


    # 10. 将处理好的资源拷贝至目标输出目录
    if config.getAssetOutDir() == "":
        return
    files = []
    utils.walkFiles(cacheDir, "", True, files)
    utils.copyFiles(cacheDir, files, config.getAssetOutDir(), True)
    utils.removeFile(cacheDir)