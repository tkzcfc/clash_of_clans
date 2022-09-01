import { RandomUtils } from "../utils/RandomUtils";
import { DBBagData } from "../../shared/db_structure/Bag";
import { DBMapData } from "../../shared/db_structure/Map";
import { DBPlayerInfo } from "../../shared/db_structure/Player";

export namespace DataFactory {
    export function newBagData(): DBBagData {
        return {
            build: {
                items: [],
            },
            currency: {
                items: [],
            }
        }
    }

    export function newMapData(uuid: string): DBMapData {
        return {
            units: [],
            uuid: uuid
        }
    }

    export function newDBPlayerInfo(pid: string): DBPlayerInfo {
        return {
            // pid
            pid: pid,
            // 昵称
            name: RandomUtils.nickname(),
            // 等级
            lv: 0,
            // 经验
            exp: 0,
            // 金币
            coins: 100,
            // 钻石
            diamonds: 0,

            mapuuid: "",

            baguuid: "",
        }
    }
}




