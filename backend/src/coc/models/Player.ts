import { BaseConnection } from "tsrpc";
import { DBPlayerInfo } from "../../shared/db_structure/Player";
import { PlayerInfo, PlayerSimpleInfo } from "../../shared/protocols/base";
import { ServiceType } from "../../shared/protocols/serviceProto";
import { RpcErrCode } from "../../shared/RpcErr";
import { DBService } from "../service/db/DBService";
import { RandomUtils } from "../utils/RandomUtils";
import { GameMap } from "./GameMap";


export class Player {
    dbData: DBPlayerInfo;
    map: GameMap;

    // 登录账号生成token
    token: string = "";
    // 玩家上线成功后的凭证
    cookie: string = "";

    conn: BaseConnection<ServiceType> | undefined;

    constructor(info: DBPlayerInfo) {
        this.dbData = info;
        this.conn = undefined;

        let map = GRpcService.mapMng.get(info.mapuuid);
        if(map) {
            this.map = map;
        }
        else {
            this.map = GRpcService.mapMng.newMap();
            this.updateToDb();
        }
    }

    /**
     * 是否在线
     * @returns 
     */
    isOnline() {
        return this.conn != undefined;
    }

    /**
     * 
     * @param conn 登录成功
     * @param isReunion 是否断线重连
     */
     login(conn: BaseConnection<ServiceType>, isReunion: boolean) {
         // 先退出当前登录
        this.logout(RpcErrCode.Offline_ALTERNATE_LOGIN);
        // 指向当前Player
        conn.currentPlayer = this;
        this.conn = conn;
        // 重置cookie
        if(!isReunion) {
            this.cookie = RandomUtils.uuid();
        }
        //发送登录需要推送的消息
        //...

        // 发送登录游戏完成消息
        this.sendMsg("msg/LoginGameFinish", {
            cookie: this.cookie,
        });
    }

    /**
     * 注销登录
     */
    logout(why: RpcErrCode) {
        if(!this.conn){
            return;
        }

        let conn = this.conn;

        conn.currentPlayer = undefined;
        this.conn = undefined;

        // 连接已断开，不用给客户端发送消息了
        if(why == RpcErrCode.Offline_DISCONNECTED) {
            return;
        }

        conn.sendMsg("msg/SelfOffline", {
            why: why,
        }).then(()=>{
            conn?.close();
        });
    }
    
    /**
     * 发送消息
     * @param msgName 
     * @param msg 
     * @returns 
     */
     sendMsg<T extends keyof ServiceType['msg']>(msgName: T, msg: ServiceType['msg'][T]) {
        if(!this.conn) {
            return undefined;
        }
        return this.conn.sendMsg(msgName, msg);
    }

    /**
     * 重置token
     * @param token 
     */
    resetToken(token?: string) {
        if(token === undefined) {
            this.token = RandomUtils.uuid();
        }
        else {
            this.token = token;
        }
    }

    toPlayerInfo(): PlayerInfo {
        return this.dbData;
    }

    toPlayerSimpleInfo(): PlayerSimpleInfo {
        return this.dbData;
    }

    /**
     * 更新到数据库
     */
    updateToDb() {
        GServiceManager.getService(DBService).autoAddData("data", "player", this.dbData);
    }
}

declare module "tsrpc" {
    export interface BaseConnection {
        currentPlayer?: Player;
    }
}