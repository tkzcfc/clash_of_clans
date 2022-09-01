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

    dbKey = dbKey.replace("\n", " ")
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

    # 解决Java版本不同时报错：Integrity check failed: java.security.NoSuchAlgorithmException: Algorithm HmacPBESHA256 not available
    # https://stackoverflow.com/questions/67631927/error-building-aab-flutter-android-integrity-check-failed-java-security-n
    # -storetype JKS 标记仅对 Java 9 或更高版本是必需的。从 Java 9 发行版开始，密钥库类型缺省为 PKS12。
    # frameworks/runtime-src/proj.android 目录中运行 gradlew signingReport 可以查看当前签名状态
    cmd = cmd + " -storetype JKS"

    # keytool -genkey -alias public_alias -keypass 147852369 -keyalg RSA -keysize 2048 -validity 36500 -storepass 147852369 -dname "CN=gainst, OU=in, O=wastes, L=beardThen, ST=timeAnd, C=scythe" -keystore D:\test\apk_key.jks
    if utils.runCmd(cmd) != 0:
        utils.error("Certificate generation failed")

def jarSigner(inApkName, outApkName):
    # abb包只能jarsigner签名
    # https://developer.android.com/studio/build/building-cmdline?hl=zh-cn

    # 签名工具
    # C:\Program Files\Java\jdk-18.0.1.1\bin\jarsigner.exe
    jarsigner = utils.joinPath(config.readEnv("AX_JDK_ROOT"), "jarsigner")


    # 删除输出文件
    utils.removeFile(outApkName)

    # V1签名
    # jarsigner -verbose -keystore [jks路径] -signedjar [V1签名完后apk文件输出路径] [需要签名的apk路径] [签名文件别名]
    # 示例：
    # jarsigner -verbose -keystore D:\cer\Android\sign.jks -signedjar D:\Android\sign_V1.apk D:\Android\jiagu.apk test
    cmd = "{0} -verbose -keystore {1} -storepass {2} -keypass {3} -signedjar {4} {5} {6}".format(
        jarsigner,
        config.getKeyStore(),
        config.getKeyStorePwd(),
        config.getKeyPassword(),
        outApkName,
        inApkName,
        config.getKeyAlias())

    if utils.runCmd(cmd) != 0:
        utils.error("v1 signing failed")

def apkSigner(inApkName, outApkName):
    # 签名工具
    # C:/Users/test/AppData/Local/Android/Sdk/build-tools/32.0.0/apksigner.bat
    apksigner = utils.joinPath(config.readEnv("AX_ANDROID_SDK_ROOT"), "apksigner")


    # 删除输出文件
    utils.removeFile(outApkName)

    # java -jar apksigner.jar sign --ks [jks路径] --ks-key-alias [签名文件别名] --ks-pass pass:[证书密码] --key-pass pass:[别名密码] --out [V2签名完后apk文件输出路径] [需要V2签名的apk路径]
    # 示例：
    # java -jar apksigner.jar sign --ks D:\cer\Android\sign.jks --ks-key-alias test --ks-pass pass:123456 --key-pass pass:123456 --out D:\Android\sign_V2.apk D:\Android\sign_V1.apk
    
    # @Ref:https://blog.csdn.net/chali1314/article/details/108464138
    # 1、该命令签名的apk为混合签名
    # java -jar apksigner.jar sign --ks debug.keystore --ks-key-alias androiddebugkey --ks-pass pass:android --key-pass pass:android --out test-new_sign.apk test-new.apk

    # 2、该命令签名的apk为纯V2签名
    # java -jar apksigner.jar sign --v1-signing-enabled false --ks debug.keystore --ks-key-alias androiddebugkey --ks-pass pass:android --key-pass pass:android --out test-new_sign.apk test-new.apk

    # 3、该命令签名的apk为纯V1签名
    # java -jar apksigner.jar sign --v2-signing-enabled false --ks debug.keystore --ks-key-alias androiddebugkey --ks-pass pass:android --key-pass pass:android --out test-new_sign.apk test-new.apk


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
    BIN_OUT_DIR = utils.joinPath(ANDROID_PROJ_DIR, "app/build/outputs/apk/release")

    utils.removeFile(BIN_OUT_DIR)

    cwd = os.getcwd()
    os.chdir(ANDROID_PROJ_DIR)
    utils.runCmd("gradlew assembleRelease")
    os.chdir(cwd)


    binFiles = []
    utils.walkFiles(BIN_OUT_DIR, ".apk", False, binFiles)
    if len(binFiles) <= 0:
        utils.error("Gradlew compilation failed")

    apkFile = binFiles[0]
    
    # 生成签名文件
    if not os.path.isfile(config.getKeyStore()):
        genKey()

    # 签名
    outApk_v2 = apkFile[:-4] + "_v2" + ".apk"
    apkSigner(apkFile, outApk_v2)

    if config.getApkOutPath() != "":
        utils.removeFile(config.getApkOutPath())
        utils.copyFile(outApk_v2, config.getApkOutPath())


def checkEnvEx(exeName, envName, example):
    needReadSysEnv = False
    envValue = ""

    try:
        ret = subprocess.run(exeName, stdout=subprocess.PIPE)
        envValue = ""
    except:
        needReadSysEnv = True

    if needReadSysEnv:
        try:
            envValue = os.environ[envName]
        except Exception:
            print("{0} not defined. Please define {0} in your environment.".format(envName))
            print("example: " + example)
            sys.exit(1)

    config.saveEnv(envName, envValue)

def checkEnv():
    if config.readEnv("OUT_FILE_EXTENSION") == "apk":
        # C:/Users/test/AppData/Local/Android/Sdk/build-tools/29.0.2/apksigner.bat
        checkEnvEx("apksigner", "AX_ANDROID_SDK_ROOT", "C:\\Users\\test\\AppData\\Local\\Android\\Sdk\\build-tools\\29.0.2\\")
    else:
        # C:\Program Files\Java\jdk-18.0.1.1\bin\jarsigner.exe
        checkEnvEx("jarsigner", "AX_JDK_ROOT", "C:\\Program Files\\Java\\jdk-18.0.1.1\\bin\\")

def checkKeyStore():
    if not os.path.isfile(config.getKeyStore()):
        genKey()

def main():
    # todo:根据传入参数区分apk和abb
    config.saveEnv("OUT_FILE_EXTENSION", "apk")

    # 环境检查
    checkEnv()
    # 签名文件检查
    checkKeyStore()

    if config.readEnv("OUT_FILE_EXTENSION") == "apk":
        makeApk()
    else:
        # abb
        pass
    utils.popFile()


# 查看签名状态命令： apksigner verify -v xxx.apk
# 查看签名信息命令： keytool -printcert -jarfile xxx.apk 