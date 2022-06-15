/*
 * Created: 2022-05-04 16:10:19
 * Author : fc
 * Description: 配置管理
 */

import { BaseMgr } from "./BaseMgr";


/**
 * 游戏配置信息
 */
 export class GameCfg {
    private json: any;
    private dataCount: number;

    public getData(key: string) {
        return this.json[key];
    }

    public getDataCount() {
        return this.dataCount;
    }

    public getItem(key: string, itemKey: string) {
        return this.json[key][itemKey];
    }

    public getJson() {
        return this.json;
    }

    constructor(json: any) {
        this.json = json;
        this.dataCount = 0;
        for (const key in json) {
            // if (Object.prototype.hasOwnProperty.call(json, key)) {
                this.dataCount++;                
            // }
        }
    }
}



export class GameCfgMgr extends BaseMgr
{
    private cfgMap: Map<string, GameCfg> = new Map();

    constructor() {
        super();
        this.loadAllCfg();
    }

    
    /**
     * 获取某个文件的配置数据
     * @param name 
     * @returns 
     */
     get(name: string): GameCfg {
        if (this.cfgMap.has(name))
            return this.cfgMap.get(name);
    }
    
    /**
     * 获取某个配置的单项配置数据
     * @param name 
     * @param key 
     * @returns 
     */
    getData(name: string, key: string | number): any {
        if(typeof(key) === 'number') {
            return this.get(name).getData(key.toString());
        }
        return this.get(name).getData(key);
    }

    getDataCount(name: string): any {
        return this.get(name).getDataCount();
    }

    /**
     * 
     * @param name 
     * @param key 
     * @param itemKey 
     * @returns 
     */
    getItem(name: string, key: string | number, itemKey: string): any {
        if(typeof(key) === 'number') {
            return this.get(name).getItem(key.toString(), itemKey);
        }
        return this.get(name).getItem(key, itemKey);
    }

    /**
     * 加载单个文件配置
     * @param name 
     * @param callback 
     */
    load(name: string, callback: Function): void {
        if (this.cfgMap.has(name))
            callback(this.cfgMap.get(name));
        else {
            var url = `config/${name}`;
            cc.resources.load(url, cc.JsonAsset, (err: Error | null, content: cc.JsonAsset) => {
                if (err) {
                    cc.error(err.message);
                }
                this.setJsonData(name, content.json);
                callback(this.cfgMap.get(name));
            });
        }
    }

    /**
     * 加载所有配置
     * @param callback 
     */
    loadAllCfg(callback?: Function) {
        // load all json in "resources/config/"
        cc.resources.loadDir('config', cc.JsonAsset, (err : Error | null, jsons: cc.JsonAsset[]) => {
            if (err) {
                cc.error(err.message);
            }

            jsons.forEach((content: cc.JsonAsset) => {
                this.setJsonData((content as any)._name, content.json);
            });

            if(callback) {
                callback();
            }
        });
    }

    setJsonData(name: string, json: any) {
        this.cfgMap.set(name, new GameCfg(json));
    }
}
