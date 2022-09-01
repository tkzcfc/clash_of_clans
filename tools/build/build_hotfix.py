# encoding : utf8
import os
import utils
import config
import step_1
import step_2
import step_3


def main(cfgfile):
    if not config.initWithFile(cfgfile):
        return

    # 工程构建
    step_1.main()
    # 资源处理
    step_2.main(False)

main("./config.json")
