/*
 * Created: 2022-05-04 16:10:19
 * Author : fc
 * Description: 配置管理
 */

import { BaseMgr } from "./BaseMgr";
import { ConfigItemType, ConfigData } from "../imports/config/GameCfgInit";

export class GameCfgMgr extends BaseMgr
{    
    // /**
    //  * 获取某个文件的配置数据
    //  * @param name 
    //  * @returns 
    //  */
    //  getCfg<K1 extends keyof ConfigItemType>(cfgName: K1) {
    //     return ConfigData[cfgName];
    // }

    /**
     * 获取某个文件的配置数据数量
     * @param name 
     * @returns 
     */
    getCfgDataCount<K1 extends keyof ConfigItemType>(cfgName: K1): number {
        let count = 0;
        const cfg = ConfigData[cfgName];
        for (const key in cfg) {
            if (Object.prototype.hasOwnProperty.call(cfg, key)) {
                count++;                
            }
        }
        return count;
    }
    
    /**
     * 获取某个配置的单项配置数据
     * @param name 
     * @param key 
     * @returns 
     */
     getData<K1 extends keyof ConfigItemType>(cfgName: K1, key: number | string): Readonly<ConfigItemType[K1]> {
        return ConfigData[cfgName][key];
    }

    /**
     * 
     * @param name 
     * @param key 
     * @param itemKey 
     * @returns 
     */
    getItem<K1 extends keyof ConfigItemType, K2 extends keyof ConfigItemType[K1]>(cfgName: K1, key: string | number, itemKey: K2): ConfigItemType[K1][K2] {
        return ConfigData[cfgName][key][itemKey];
    }
}
