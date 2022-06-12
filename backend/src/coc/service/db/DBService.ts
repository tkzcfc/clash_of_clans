/*
 * Created: 2022-03-19 13:56:50
 * Author : fc
 * Description: 数据库服务
 */

import { IService } from "../IService";
import { dbConfig } from "./dbConfig";
import { LocalStorage } from "./LocalStorage";

export class DBService extends IService {
    // 本都存储
    storages : LocalStorage[] = [];
    storageMap = new Map<string, LocalStorage>();
    
    onLoadSync(): boolean {
        let storage = new LocalStorage();
        storage.addTable("data", "user");
        storage.addTable("data", "bag");
        storage.addTable("data", "map");
        storage.addTable("data", "player");
        this.addStorage(storage);

        return true;
    }

    onStart(): Promise<void> {
        return new Promise<void>((resolve, reject)=>{
            this.open().then((ok)=>{
                if(ok)
                    resolve();
                else
                    reject();
            }, reject);
        });
    }

    async onStop(): Promise<void> {
        for(let i = 0; i < this.storages.length; ++i) {
            await this.storages[i].close()
        }
    }

    async open() {
        for(let i = 0; i < this.storages.length; ++i) {
            if(!await this.storages[i].open())
                return false;
        }
        return true;
    }
    
    /**
     * 自动处理添加/更新数据
     */
     autoAddData<K1 extends keyof dbConfig, K2 extends keyof dbConfig[K1], K3 extends dbConfig[K1][K2]>(dbName: K1, tabName: K2, data: K3) {
         this.storageMap.get(dbName)?.autoAddData(tabName as string, data);
     }

    /**
     * 自动删除数据
     */
     autoDelData<K1 extends keyof dbConfig, K2 extends keyof dbConfig[K1], K3 extends dbConfig[K1][K2]>(dbName: K1, tabName: K2, data: K3) {
        this.storageMap.get(dbName)?.autoDelData(tabName as string, data);
    }
    
    /**
     * 删除数据
     */
     delData<K1 extends keyof dbConfig, K2 extends keyof dbConfig[K1]>(dbName: K1, tabName: K2, id: number) {
        this.storageMap.get(dbName)?.delData(tabName as string, id);
    }

    onRead<K1 extends keyof dbConfig, K2 extends keyof dbConfig[K1], K3 extends dbConfig[K1][K2]>(dbName: K1, tabName: K2, handler: (t: K3)=>void, context: any) {
        this.storageMap.get(dbName)?.getEventEmitter(tabName as string)?.on("read", (data: K3)=>{
            handler.call(context, data);
        }, context);
    }

    private addStorage(storage: LocalStorage) {
        this.storages.push(storage);
        this.storageMap.set(storage.dbname, storage);
    }
}
