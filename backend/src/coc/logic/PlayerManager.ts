import { DBService } from "../service/db/DBService";
import { CryptoUtils } from "../utils/CryptoUtils";
import { Player } from "./Player";



export class PlayerManager {
    players: Player[] = [];
    playerMap = new Map<string, Player>();

    constructor() {
        GServiceManager.getService(DBService).onRead("data", "player", data=>{
            let player = new Player(data);
            this.players.push(player);
            this.playerMap.set(data.pid, player);
        }, this);
    }

    get(pid: string) {
        return this.playerMap.get(pid);
    }

    newPlayer() {
        while(true) {
            let pid = CryptoUtils.generateUUID();
            if(!this.playerMap.get(pid)) {
                return this.newPlayerEx(pid);
            }
        }        
    }

    /**
     * 
     * @param pid 
     */
    newPlayerEx(pid: string) {
        let player = new Player({
            // pid
            pid: pid,
            // 昵称
            name: CryptoUtils.generateUUID(),
            // 等级
            lv: 0,
            // 经验
            exp: 0,
            // 金币
            coins: 100,
            // 钻石
            diamonds: 0,

            map: {
                units: [],
            },

            bag: {
                build: [],
            }
        });
        this.players.push(player);
        this.playerMap.set(pid, player);

        player.updateToDb();

        return player;
    }
}
