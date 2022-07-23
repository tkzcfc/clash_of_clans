import os
import os.path
import json
import sys
# import urllib.request
import shutil
import hashlib
import zipfile
import platform


def error(msg):
    print(msg, file = sys.stderr)
    sys.exit(1)

def zipFiles(zipFileName, files, startDirName, showPercent):
    baseName = os.path.basename(zipFileName)

    # 创建 zip 文件
    # with zipfile.ZipFile(zipFileName, 'w', zipfile.ZIP_DEFLATED, compresslevel = 9) as myzip:
    with zipfile.ZipFile(zipFileName, 'w', zipfile.ZIP_DEFLATED) as myzip:
        count = 0
        for f in files:
            # 修改时间，保证所有 zip 文件时间一致
            from datetime import datetime
            t = datetime.fromisoformat('2021-01-01T00:00:00+00:00').timestamp()
            os.utime(f, (t, t))

            file_name = os.path.relpath(f, startDirName)
            myzip.write(f, arcname = file_name)
            # print("f:", f, ", arcname:", file_name)

            count = count + 1
            showProgress(count / len(files), baseName)

        myzip.close()
        showProgressFinish()

def zipDir(zipFileName, dirs, startDirName, showPercent):
    files = []
    for d in dirs:
        for root, dirName, flist in os.walk(d):
            for f in flist:
                files.append(os.path.join(root, f))

    zipFiles(zipFileName, files, startDirName, showPercent)
    return True


def md5File(file_path):
    with open(file_path, 'rb') as f:
        md5obj = hashlib.md5()
        md5obj.update(f.read())
        md5 = md5obj.hexdigest()
        return md5

def md5Str(str):
    md5obj = hashlib.md5()
    md5obj.update(str.encode("utf-8"))
    md5 = md5obj.hexdigest()
    return md5

def readJsonFromFile(file_path):
    if not os.path.isfile(file_path):
        print("Invalid file: " + file_path)
        return None

    fp = open(file_path, "rt")
    if not fp:
        print("Open failed: " + file_path)
        return None

    data = fp.read()
    fp.close()
    if not data:
        print("Cannt read: " + file_path)
        return None

    # print(data)
    cfg = json.loads(data)
    if not cfg:
        print("JSON parsing failed: " + data)
        return None

    return cfg

def readDataFromFile(file_path):
    if not os.path.isfile(file_path):
        print("Invalid file: " + file_path)
        return None

    fp = open(file_path, "rt")
    if not fp:
        print("Open failed: " + file_path)
        return None

    data = fp.read()
    fp.close()
    if not data:
        print("Cannt read: " + file_path)
        return None
        
    return data

def writeDataToFile(file_path, data):
    dir_, file_ = os.path.split(file_path)
    if dir_ and not os.path.exists(dir_):
        os.makedirs(dir_)
    fp = open(file_path, "w")
    if not fp:
        print("open file : %s failed" % file_path)
        return None
    fp.write(data)
    fp.close()
    return True

def copyFile(src, dst):
    dir_, file_ = os.path.split(dst)
    if dir_ and not os.path.exists(dir_):
        os.makedirs(dir_)
    return shutil.copyfile(src, dst)


def copyFiles(srcDir, files, dstDir, showPercent):
    count = 0
    for f in files:
        relFileName  = os.path.relpath(f, srcDir)
        dstFilePath = os.path.join(dstDir, relFileName)

        dirName, _ = os.path.split(dstFilePath)
        if dirName and not os.path.isdir(dirName):
            os.makedirs(dirName)

        if os.path.isfile(f):
            shutil.copyfile(f, dstFilePath)
        else:
            shutil.copytree(f, dstFilePath)

        count = count + 1
        showProgress(count / len(files), "copy file")
    showProgressFinish()


def moveFiles(srcDir, files, dstDir):
    for f in files:
        relFileName  = os.path.relpath(f, srcDir)
        dstFilePath = os.path.join(dstDir, relFileName)

        dirName, _ = os.path.split(dstFilePath)
        if dirName and not os.path.isdir(dirName):
            os.makedirs(dirName)

        shutil.move(f, dstFilePath)


def removeFile(file):
    if os.path.isdir(file):
        # shutil.rmtree(file)
        file = os.path.normpath(file)
        import shutil
        shutil.rmtree(file)
    elif os.path.isfile(file):
        os.remove(file)


def fileSize(filePath):
    return os.path.getsize(filePath)

# 遍历文件夹
# dir 文件目录
# suffix 文件后缀
# recursion 是否递归文件夹
# outList 输出列表
def walkFiles(dir, suffix, recursion, outList):
    if not os.path.isdir(dir):
        return

    dirs = []
    for file in os.listdir(dir):
        fullPath = os.path.join(dir, file)
        if os.path.isfile(fullPath):
            if suffix == "" or suffix == "." or file.endswith(suffix):
                outList.append(fullPath)
        elif recursion and os.path.isdir(fullPath):
            dirs.append(fullPath)

    for dname in dirs:
        walkFiles(dname, suffix, recursion, outList)

# 格式化路径
def fmtPath(path):
    path = path.replace("\\", "/")
    path = path.replace("//", "/")
    return path

# 通过两个文件名称判断是否是同一个文件
def equalFile(fileName1, fileName2):
    return fmtPath(fileName1) == fmtPath(fileName2)


# 通过配置列表遍历文件
# // 包含src/cocos目录下的所有文件，会递归子文件夹
# "src/cocos/*" 或 "src/cocos/"
# 
# // 只包含src目录下的所有文件，不会递归子文件夹
# "src/*."
# 
# // 只包含src目录下的lua文件，不会递归子文件夹
# "src/*.lua"
# 
# // 只包含src目录下的 main.lua
# "src/main.lua"

def getFilesByCfgList(rootDir, cfgList):
    files = []

    # 文件目录不存在
    if not os.path.isdir(rootDir):
        return files
        # 直接退出
        # error("The folder '%s' does not exist" % dir)

    for key in cfgList:
        ks = key.split("*")
        dirName = os.path.join(rootDir, ks[0])
        if len(ks) == 2:
            walkFiles(dirName, ks[1], ks[1] == "" or ks[0] == "", files)
        elif len(ks) == 1:
            if key[-1:] == "/":
                walkFiles(dirName, "", True, files)
            else:
                sufiles = []
                walkFiles(os.path.join(rootDir, os.path.dirname(key)), "", False, sufiles)
                for sufile in sufiles:
                    if equalFile(sufile, joinPath(rootDir, key)):
                        files.append(sufile)

    # 列表去重
    cleanList = []
    for file in files:
        if file not in cleanList:
            cleanList.append(file)

    return cleanList

def runCmd(cmd):
    print("execute command:" + cmd)
    return os.system(cmd)


def isInt(a):
    try:
        s=int(a)
        return True
    except ValueError as e:
        return False

lastPercent = -1

def showProgress(percent, tag):
    global lastPercent
    # 进度条长度
    totalCount = 20

    curCount = int(percent * totalCount)
    fill = "#" * curCount
    rest = " " * (totalCount - curCount)

    percent = int(percent * 100)
    if percent == lastPercent:
        return

    lastPercent = percent
    sys.stdout.write("\r%.f%%[%s%s] %s" % (percent, fill, rest, tag))
    sys.stdout.flush()

def showProgressFinish():
    global lastPercent
    lastPercent = -1
    sys.stdout.write("\n")
    sys.stdout.flush()

def joinPath(dirName, fileName):
    fileName = fileName.lstrip("/\\")
    return os.path.join(dirName, fileName)

def isWindows():
    info = platform.architecture()
    if info[1].startswith("Windows"):
        return True
    return False