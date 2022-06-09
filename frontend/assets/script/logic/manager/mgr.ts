/*
 * Created: 2022-05-01 21:16:56
 * Author : fc
 * Description: 
 */

import { BaseMgr } from "./BaseMgr";
import { FightMgr } from "./FightMgr";
import { GameCfgMgr } from "./GameCfgMgr";
import { LoginMgr } from "./LoginMgr";



export namespace mgr {

    var msgMap = new Map<{prototype: BaseMgr}, BaseMgr>();

    export function initialize() {
        addMgr(GameCfgMgr);
        addMgr(LoginMgr);
        addMgr(FightMgr);
    }

    export function termination() {
        msgMap.forEach((current: BaseMgr)=>{
            current.onDestroy();
        });
        msgMap.clear();
    }

    /**
     * 获取对应类型的manager
     * @param type 
     * @returns 
     */
     export function getMgr<T extends BaseMgr>(type: {prototype: T}) : T {
        return msgMap.get(type) as T;
    }


    ///////////////////// private  /////////////////////
    function addMgr<T extends BaseMgr>(type: {new(): T}): T {
        let value = new type();
        msgMap.set(type, value);
        return value;
    }
}
