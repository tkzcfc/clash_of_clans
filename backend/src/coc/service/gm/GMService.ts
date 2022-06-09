/*
 * Created: 2022-03-19 15:08:33
 * Author : fc
 * Description: GM服务
 */

import { UserInfo } from "../../const/dbConfig";
import { DBService } from "../db/DBService";
import { IService } from "../IService";
var http = require("http")
// var fs = require("fs")

export class GMService extends IService {
    server:any;
    sockets: any[] = [];

	onStartSync(): boolean {                
        this.server = http.createServer((request: any, response: any)=>{
            // console.log("request.url", request.url);
            let url = request.url;
            let paramsMap = new Map<string, string>();
            
            if (request.url.indexOf('?') !== -1) {
                let params = request.url.split("?");

                url = params[0];
                if(params.length > 1 && params[1] !== "") {
                    params = params[1].split("&");
                }

                params.forEach((str: string)=>{
                    let keyValue = str.split("=");
                    paramsMap.set(keyValue[0], keyValue[1]);
                });
                
                // paramsMap.forEach((value, key)=>{
                //     console.log(`key:${key}, value:${value}`);
                // });
            }


            if(GGmEventEmitter.emit(url, paramsMap, request, response) == 0) {
                // console.log("request------------->>");
                // console.log(request);
                // fs.createReadStream("index.html").pipe(response);
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({
                    data: 'Unknown command',
                    url: url
                }));
            }
        });
        this.server.on("connection",(socket: any)=>{
            this.sockets.push(socket);
            socket.once("close",()=>{
               this.sockets.splice(this.sockets.indexOf(socket),1);
            });
          });

        this.initEvent();

        return this.server.listen(GConst.GMPort);
	}

    initEvent() {
        GGmEventEmitter.on("/stop_fc", (paramsMap : Map<string, string>, request: any, response: any)=>{
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                data: 'ok'
            }));

            GServiceManager.stop();
        }, this);

        
        // GGmEventEmitter.on("/add", (paramsMap : Map<string, string>, request: any, response: any)=>{
        //     response.writeHead(200, { 'Content-Type': 'application/json' });
        //     response.end(JSON.stringify({
        //         data: 'add ok',
        //     }));

        //     let data: UserInfo = {
        //         account: paramsMap.get("account") || "default_account",
        //         password: paramsMap.get("password") || "default_password",
        //     };
        //     GServiceManager.getService(DBService).autoAddData("data", "user", data);

        // }, this);

        
        // GGmEventEmitter.on("/remove", (paramsMap : Map<string, string>, request: any, response: any)=>{
        //     response.writeHead(200, { 'Content-Type': 'application/json' });
        //     response.end(JSON.stringify({
        //         data: 'remove ok',
        //     }));

        //     let id = Number.parseInt(paramsMap.get("id") || "0")
        //     GServiceManager.getService(DBService).delData("data", "user", id);
        // }, this);
    }

    onStop(): Promise<void> {
        return new Promise<void>((resolve, reject)=>{
            GGmEventEmitter.clear();

            this.sockets.forEach(function(socket){
                socket.destroy();
            });
            this.server.close(resolve);
        }); 
    }
}

