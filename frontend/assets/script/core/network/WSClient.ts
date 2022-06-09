/*
 * Created: 2022-03-16 09:15:58
 * Author : fc
 * Description: WebSocket客户端管理
 */


import { Logger } from "../common/log/Logger";
import { PackMsg } from "./PackMsg";
import { core } from "../InitCore";
import { CoreEvent } from "../common/event/CoreEvent";

class Session {
    ws: WebSocket;
    packMsg: PackMsg;
    url: string;
    key: string;

    constructor(key: string, url: string){
        this.key = key;
        this.url = url;
    }

    doConnect() {
        core.sysEventEmitter.emit(CoreEvent.NET_ON_CONNECT_START, this.key, this.url);

        this.ws = new WebSocket(this.url);
        this.ws.binaryType = "arraybuffer";
        this.ws.onmessage = (evt) => {
            if(!this.packMsg.read(evt.data)) {
                Logger.logNet("消息解码或校验失败，关闭套接字");
                this.close();
            }
        };
        this.ws.onopen = (evt)=> {
            Logger.logNet(`连接'${this.url},连接成功'`)
            core.sysEventEmitter.emit(CoreEvent.NET_ON_OPEN, this.key, this.url);
        };
        this.ws.onclose = (evt)=> {
            Logger.logNet(`连接'${this.url},连接关闭'`)
            core.sysEventEmitter.emit(CoreEvent.NET_ON_CLOSE, this.key, this.url);
        };
        this.ws.onerror = (evt)=> {
            cc.log(evt);
            Logger.logNet(`连接'${this.url},连接错误'`)
            core.sysEventEmitter.emit(CoreEvent.NET_ON_ERROR, this.key, this.url);
        };
        
        this.packMsg = new PackMsg();
        this.packMsg.setSendCallback((data: ArrayBuffer)=>{
            this.ws.send(data);
        });
        this.packMsg.setRecvCallback((msgid, msg)=>{
            if(msg === "") {
                msg = "{}";
            }
            Logger.logNet(`recv msgid:${msgid}, msg:${msg}`);
            core.netEventEmitter.emit(msgid, JSON.parse(msg));
        });
    }

    close(code?: number, reason?: string) {
        if(!this.ws){
            return;
        }

        this.ws.onmessage = ()=>{};

        if(reason === undefined) {
            if(code === undefined)
                this.ws.close();
            else
                this.ws.close(code);
        }
        else {
            this.ws.close(code, reason);
        }
        this.ws = null;
    }
}

export class WSClient {
    private _sessionMap : Map<string, Session>;

    constructor() {
        this._sessionMap = new Map<string, Session>();
    }

    /**
     * 连接服务器
     * @param key 此次连接的名称
     * @param options URL
     * @returns 
     */
    connect(key: string, options: any) {
        let session = this._sessionMap.get(key);
        if (session && session.ws) {
            if (session.ws.readyState === WebSocket.CONNECTING) {
                Logger.logNet(`连接'${key}',正在连接中...`)
                return false;
            }
            else if(session.ws.readyState === WebSocket.OPEN) {
                Logger.logNet(`连接'${key}',已存在`)
                return true;
            }
        }


        let url = null;
        if (options.url) {
            url = options.url;
        }
        else {
            let ip = options.ip;
            let port = options.port;
            let protocol = options.protocol;
            url = `${protocol}://${ip}:${port}`;
        }

        if(session) {
            session.close();
        }
        else {
            session = new Session(key, url);
            this._sessionMap.set(key, session);
        }
        
        session.doConnect();

        return true;
    }

    /**
     * 
     * @param key 
     */
    isConnect(key: string) {
        let session = this._sessionMap.get(key);
        if (session) {
            if(session.ws.readyState === WebSocket.OPEN) {
                return true;
            }
        }
        return false;
    }

    /**
     * 向某个连接发送json
     * @param key 
     * @param msgid 
     * @param msg 
     */
    sendJson(key: string, msgid: number, msg: any) {
        if(!msg) {
            msg = {};
        }
        this.send(key, msgid, JSON.stringify(msg));
    }

    /**
     * 向某个连接发送消息
     * @param key 
     * @param msgid 消息id
     * @param msg 消息数据
     * @returns 
     */
    send(key: string, msgid: number, msg: string): boolean {
        let session = this._sessionMap.get(key);
        if(!session) {
            Logger.logNet(`不存在连接'${key}'`)
            return false;
        }

        if(session.ws.readyState === WebSocket.OPEN) {
            Logger.logNet(`send msgid:${msgid}, msg:${msg}`);
            session.packMsg.write(msgid, msg);
            return true;
        }
        else {
            Logger.logNet(`连接'${key},当前不处于已连接状态'`)
        }
        return false;
    }

    disconnect(key: string) {
        let session = this._sessionMap.get(key);
        if(!session) {
            return;
        }

        session.close();
    }

    /**
     * 关闭某个连接
     * @param key 
     * @param code 
     * @param reason 
     * @returns 
     */
    close(key: string, code?: number, reason?: string) {
        let session = this._sessionMap.get(key);
        if(!session) {
            return;
        }
        session.close(code, reason);
        this._sessionMap.delete(key);
    }
}