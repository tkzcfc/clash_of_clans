import { DBAccountInfo } from "../../shared/db_structure/Account";
import { RpcErrCode } from "../../shared/RpcErr";
import { DBService } from "../service/db/DBService";
import { Player } from "../models/Player";
import { IManager } from "./IManager";


/**
 * 账号管理
 */
export class AccountManager implements IManager {
    
    datas: DBAccountInfo[] = [];

    onStart(): void {
        GServiceManager.getService(DBService).onRead("data", "user", (data: DBAccountInfo)=>{
            this.datas.push(data)
        }, this);
    }

    /**
     * 查询账号是否存在
     * @param account 
     * @returns 
     */
    contain(account: string) {
        return this.get(account) !== undefined;
    }

    /**
     * 登录账号
     * @param account 
     * @param password 
     * @returns 登录结果 
     */
    login(account: string, password: string) {
        for(let i = 0, j = this.datas.length; i < j; ++i) {
            if(this.datas[i].account === account){
                if(this.datas[i].password === password)
                {
                    return RpcErrCode.OK;
                }
                return RpcErrCode.BAD_PASSWORD;
            }
        }
        return RpcErrCode.NOT_ACCOUNT;
    }

    /**
     * 获取账号拥有的玩家信息
     * @param account 
     * @returns 
     */
    getPlayers(account: string) {
        let players:Player[] = [];

        let actData = this.get(account);
        if(!actData) {
            return players;
        }

        actData.players.forEach((pid: string)=>{
            let player = GRpcService.playerMng?.get(pid);
            if(player) {
                players.push(player);
            }
        });

        return players;
    }

    /**
     * 获取账号信息
     * @param account 
     * @returns 
     */
    get(account: string) {
        for(let i = 0, j = this.datas.length; i < j; ++i) {
            if(this.datas[i].account === account){
                return this.datas[i];
            }
        }
    }

    /**
     * 添加新的账号信息
     * @param data 
     */
    newAccount(data: DBAccountInfo) {
        this.datas.push(data);
        GServiceManager.getService(DBService).autoAddData("data", "user", data);
    }
}
