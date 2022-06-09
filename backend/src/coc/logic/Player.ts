import { BaseConnection } from "tsrpc";
import { OfflineCode } from "../../shared/protocols/msg/MsgSelfOffline";
import { ServiceType } from "../../shared/protocols/serviceProto";
import { DBPlayerInfo } from "../const/dbConfig";
import { DBService } from "../service/db/DBService";
import { CryptoUtils } from "../utils/CryptoUtils";


export class Player {
    dbInfo: DBPlayerInfo;

    // 登录账号生成token
    token: string = "";

    // 玩家上线成功后的凭证
    voucher: string = "";

    conn: BaseConnection<ServiceType> | undefined;

    constructor(info: DBPlayerInfo) {
        this.dbInfo = info;
        this.conn = undefined;
    }

    /**
     * 是否在线
     * @returns 
     */
    isOnline() {
        return this.conn != undefined;
    }

    /**
     * 注销登录
     */
    logout(why: OfflineCode) {
        let conn = this.conn;
        if(!conn || !this.isOnline())
            return;

        this.conn = undefined;

        conn.sendMsg("msg/SelfOffline", {
            why: why,
        }).then(()=>{
            conn?.close();
        });
    }

    /**
     * 重置token
     * @param token 
     */
    resetToken(token?: string) {
        if(token === undefined) {
            this.token = CryptoUtils.generateUUID();
        }
        else {
            this.token = token;
        }
    }

    /**
     * 更新到数据库
     */
    updateToDb() {
        GServiceManager.getService(DBService).autoAddData("data", "player", this.dbInfo);
    }
}

