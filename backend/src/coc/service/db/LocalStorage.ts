
import { SqliteDB } from "./SqliteDB";
import { StringUtils } from "../../utils/StringUtils";
import { dbConfig } from "./dbConfig";
import { EventEmitter } from "../../common/EventEmitter";

export class LocalStorage {
    // sql操作
    readonly sql : SqliteDB = new SqliteDB();
    
    // db name
    public dbname: string = "";
    // 事件派发器
    private eventEmitterMap = new Map<string, EventEmitter<string>>();

    // table names
    private tabs: string[] = [];
    // id计数
    private tabCountMap: Map<string, number> = new Map<string, number>();

    addTable<K1 extends keyof dbConfig, K2 extends keyof dbConfig[K1]>(dbname: K1, tabname: K2) {
        if(this.dbname === "") {
            this.dbname = dbname;
        }
        console.assert(this.dbname === dbname);
        this.tabs.push(tabname as string);
        this.tabCountMap.set(tabname as string, 0);
        this.eventEmitterMap.set(tabname as string, new EventEmitter<string>());
    }

    async open(): Promise<boolean> {
        this.sql.initWithFile(this.dbname + ".db");
        for (let i = 0; i < this.tabs.length; i++) {
            let ok = await this.openTable(i);
            if(!ok) {
                return false;
            }
        }
        return true;
    }

    async close(): Promise<void> {
        return new Promise<void>((resolve, reject)=>{
            this.sql.close(resolve);
        });
    }

    /**
     * 自动处理添加/更新数据
     */
     public autoAddData(tabName: string, data: any) {
        let id = data._db_id_;
        let tabCount = this.curTabDataCount(tabName);
        
        if(id === undefined) {
            tabCount++;
            id = tabCount;
            
            this.tabCountMap.set(tabName, tabCount);
            this.addData(tabName, id, data);
        }
        else {
            console.assert(id <= tabCount);

            data._db_id_ = undefined;
            this.updateData(tabName, id, data);
            
        }
        
        data._db_id_ = id;
    }

    public autoDelData(tabName: string, data: any) {
        let id = data._db_id_;
        if(id === undefined || id > this.curTabDataCount(tabName)) {
            return;
        }
        this.delData(tabName, id);
    }
    
    public getEventEmitter(tabName: string) {
        return this.eventEmitterMap.get(tabName);
    }

    ////////////////////////////////////////////////// private //////////////////////////////////////////////////
    
    /**
     * 初始化table，并查询数据
     * @param index 
     * @returns 
     */
     private async openTable(index: number): Promise<boolean> { 
        const tableName = this.tabs[index];

        let createTableSql = `create table if not exists ${tableName}(id INTEGER, data BLOB);`;
        let querySql = `select * from ${tableName}`;

        let ok = await this.sql.createTable(createTableSql);
        if(!ok) {
            return false;
        }

        let objects = await this.sql.queryData(querySql);
        
        const eventEmitter = this.getEventEmitter(tableName);
        let maxDbId = 0;

        for(let j = 0; j < objects.length; ++j) {
            const object = objects[j];
            let data = StringUtils.decodeBlob(object.data);
            data._db_id_ = object.id;

            if(object.id > maxDbId) {
                maxDbId = object.id;
            }
            
            eventEmitter?.emit("read", data);
        }
        
        this.tabCountMap.set(tableName, maxDbId);

        return true;
    }

    /**
     * 添加数据
     */
    private addData(tabName: string, id: number, data: any) {
        // 剔除runtime数据
        let runtime = data.runtime;
        data.runtime = undefined;

        let datas = [[id, StringUtils.encodeBlob(data)]];
        let insertSql = `insert into ${tabName}(id, data) values(?, ?)`;
        this.sql.insertData(insertSql, datas);

        // 恢复runtime数据
        data.runtime = runtime;
    }

    /**
     * 更新数据
     */
    private updateData(tabName: string, id: number, data: any) {
        // 剔除runtime数据
        let runtime = data.runtime;
        data.runtime = undefined;

        data = StringUtils.encodeBlob(data);
        let updateSql = `update ${tabName} set data = '${data}' where id = ${id}`;
        this.sql.executeSql(updateSql);
        
        // 恢复runtime数据
        data.runtime = runtime;
    }
    
    /**
     * 删除数据
     */
     public delData(tabName: string, id: number) {
        let tabCount = this.curTabDataCount(tabName);
        if(id > tabCount) {
            console.log(`无效id=${id}`);
            return;
        }
        let updateSql = `delete from ${tabName} where id = ${id}`;
        this.sql.executeSql(updateSql);
    }

    private curTabDataCount(tabName: string): number {
        let count = this.tabCountMap.get(tabName);
        if(count === undefined) {
            console.assert(false);
            return 0;
        }
        return count;
    }
}
