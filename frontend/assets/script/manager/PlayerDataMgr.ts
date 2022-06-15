import { PlayerInfo, PlayerMap } from "../shared/protocols/base";
import { BaseMgr } from "./BaseMgr";

export class PlayerDataMgr extends BaseMgr {
    player : PlayerInfo;
    map: PlayerMap;

    set(player: PlayerInfo, map: PlayerMap) {
        this.player = player;
        this.map = map;
    }
}

