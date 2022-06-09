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

    createTable(sql: string) {
        this.db.serialize(()=>{
            this.db.run(sql, (err: Error)=>{
                if(null != err){
                    printErrorInfo(err);
                    return;
                }
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

    queryData(sql: string, callback: Function) {
        this.db.all(sql, function(err: any, rows: any){
            if(null != err){
                printErrorInfo(err);
                return;
            }
     
            /// deal query data.
            if(callback){
                callback(rows);
            }
        });
    }

    executeSql(sql : string) {
        this.db.run(sql, (err: Error) => {
            if(null != err){
                printErrorInfo(err);
            }
        });
    }

    close(callback : Function) {
        this.db.close(callback);
    }
}
