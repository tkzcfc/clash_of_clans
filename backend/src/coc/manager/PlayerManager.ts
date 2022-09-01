import { DataFactory } from "../models/DataFactory";
import { Player } from "../models/Player";
import { DBService } from "../service/db/DBService";
import { RandomUtils } from "../utils/RandomUtils";
import { IManager } from "./IManager";


/**
 * 玩家管理
 */
export class PlayerManager implements IManager {
    players: Player[] = [];
    playerMap = new Map<string, Player>();

    onStart(): void {
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
            let pid = RandomUtils.uuid();
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
        let player = new Player(DataFactory.newDBPlayerInfo(pid));
        this.players.push(player);
        this.playerMap.set(pid, player);

        player.updateToDb();

        return player;
    }
}
