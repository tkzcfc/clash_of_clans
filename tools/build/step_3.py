# encoding : utf8
import os
import utils
import sys
import config
import platform
import random


def genKey():
    dbKey = '''Shakespeare Sonnet 12
When I do count the clock that tells the time
And see the brave day sunk in hideous night
When I behold the violet past prime
And sable curls all silverd oer with white
When lofty trees I see barren of leaves
Which erst from heat did canopy the herd
And summers green all girded up in sheaves
Born on the bier with white and bristly beard
Then of thy beauty do I question make
That thou among the wastes of time must go
Since sweets and beauties do themselves forsake
And die as fast as they see others grow
And nothing gainst Times scythe can make defence
Save breed to brave him when he takes thee hence'''

    keys = dbKey.split(" ")
    
    name = ""
    name = name + "CN=" + keys[random.randint(1, len(keys)) - 1] + ", "
    name = name + "OU=" + keys[random.randint(1, len(keys)) - 1] + ", "
    name = name + "O=" + keys[random.randint(1, len(keys)) - 1] + ", "
    name = name + "L=" + keys[random.randint(1, len(keys)) - 1] + ", "
    name = name + "ST=" + keys[random.randint(1, len(keys)) - 1] + ", "
    name = name + "C=" + keys[random.randint(1, len(keys)) - 1]

    cmd = "keytool -genkey -alias {0} -keypass {1} ".format(config.getKeyAlias(), config.getKeyPassword())
    cmd = cmd + "-keyalg RSA -keysize 2048 -validity 36500 -storepass {0} -dname \"{1}\" -keystore {2}".format(config.getKeyStorePwd(), name, config.getKeyStore())

    # keytool -genkey -alias public_alias -keypass 147852369 -keyalg RSA -keysize 2048 -validity 36500 -storepass 147852369 -dname "CN=gainst, OU=in, O=wastes, L=beardThen, ST=timeAnd, C=scythe" -keystore D:\test\apk_key.jks
    if utils.runCmd(cmd) != 0:
        utils.error("Certificate generation failed")

def jarSigner(inApkName, outApkName):
    # 签名工具
    # C:\Program Files\Java\jdk-18.0.1.1\bin\jarsigner.exe
    # abb包只能jarsigner签名
    # https://developer.android.com/studio/build/building-cmdline?hl=zh-cn

    # 删除输出文件
    utils.removeFile(outApkName)

    # V1签名
    # jarsigner -verbose -keystore [jks路径] -signedjar [V1签名完后apk文件输出路径] [需要签名的apk路径] [签名文件别名]
    # 示例：
    # jarsigner -verbose -keystore D:\cer\Android\sign.jks -signedjar D:\Android\sign_V1.apk D:\Android\jiagu.apk test
    cmd = "jarsigner -verbose -keystore {0} -storepass {1} -keypass {2} -signedjar {3} {4} {5}".format(
        config.getKeyStore(),
        config.getKeyStorePwd(),
        config.getKeyPassword(),
        outApkName,
        inApkName,
        config.getKeyAlias())
    if utils.runCmd(cmd) != 0:
        utils.error("v1 signing failed")

def apkSigner(inApkName, outApkName):
    if not os.path.isfile(config.getKeyStore()):
        genKey()

    # 签名工具
    # C:/Users/test/AppData/Local/Android/Sdk/build-tools/29.0.2/apksigner.bat
    apksigner = utils.joinPath(config.getAndroidSdkBuildTools(), "apksigner")

    # 删除输出文件
    utils.removeFile(outApkName)

    # V2签名
    # java -jar apksigner.jar sign --ks [jks路径] --ks-key-alias [签名文件别名] --ks-pass pass:[证书密码] --key-pass pass:[别名密码] --out [V2签名完后apk文件输出路径] [需要V2签名的apk路径]
    # 示例：
    # java -jar apksigner.jar sign --ks D:\cer\Android\sign.jks --ks-key-alias test --ks-pass pass:123456 --key-pass pass:123456 --out D:\Android\sign_V2.apk D:\Android\sign_V1.apk

    cmd = "{0} sign --ks {1} --ks-key-alias {2} --ks-pass pass:{3} --key-pass pass:{4} --out {5} {6}".format(
        apksigner, 
        config.getKeyStore(), 
        config.getKeyAlias(), 
        config.getKeyStorePwd(),
        config.getKeyPassword(),
        outApkName,
        inApkName)

    if utils.runCmd(cmd) != 0:
        utils.error("v2 signing failed")

def makeApk():
    ANDROID_PROJ_DIR = utils.joinPath(config.getRootDir(), "frameworks/runtime-src/proj.android-studio")
    cwd = os.getcwd()
    os.chdir(ANDROID_PROJ_DIR)

    utils.runCmd("gradlew assembleRelease")

    os.chdir(cwd)

    apkName = utils.joinPath(ANDROID_PROJ_DIR, config.getAndroidAppOutputPath())
    if not os.path.isfile(apkName):
        utils.error("make apk fail.")

    # 生成签名文件
    if not os.path.isfile(config.getKeyStore()):
        genKey()

    # 签名
    outApk_v2 = apkName[:-4] + "_v2" + ".apk"
    apkSigner(apkName, outApk_v2)

    if config.getApkOutPath() != "":
        utils.removeFile(config.getApkOutPath())
        utils.copyFile(outApk_v2, config.getApkOutPath())


def main():
    makeApk()


# 查看签名状态命令： apksigner verify -v xxx.apk
# 查看签名信息命令： keytool -printcert -jarfile xxx.apk 