/*
 * Created: 2022-03-19 14:06:49
 * Author : fc
 * Description: 对sqlite3进行简单的封装
 * Ref: https://blog.csdn.net/wap1981314/article/details/81185768
 */

var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

function printErrorInfo(err: Error){
    console.log("DB Error Message:" + err.message);
};

export class SqliteDB {
    db : any;

    initWithFile(file: string) {
        this.db = new sqlite3.Database(file);
     
        let exist = fs.existsSync(file);
        if(!exist){
            console.log("Creating db file!");
            fs.openSync(file, 'w');
        };        
    }

    async createTable(sql: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) =>{
            this.db.serialize(()=>{
                this.db.run(sql, (err: Error)=>{
                    if(null != err){
                        printErrorInfo(err);
                    }
                    resolve(!err);
                });
            });
        });
    }

    insertData(sql: string, objects: any) {
        this.db.serialize(() => {
            var stmt = this.db.prepare(sql);

            for(var i = 0; i < objects.length; ++i){
                stmt.run(objects[i]);
            }        
            stmt.finalize();
        });
    }

    async queryData(sql: string): Promise<any> {
        return new Promise<any>((resolve, reject)=>{
            this.db.all(sql, function(err: any, rows: any){
                if(null != err){
                    printErrorInfo(err);
                    reject();
                    return;
                }
         
                /// deal query data.
                resolve(rows);
            });
        });
    }

    async executeSql(sql : string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject)=>{
            this.db.run(sql, (err: Error) => {
                if(null != err){
                    printErrorInfo(err);
                }
                resolve(!err);
            });
        });
    }

    close(callback : Function) {
        this.db.close(callback);
    }
}
