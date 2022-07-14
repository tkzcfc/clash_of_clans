import { GameMode } from "../coc/const/enums";
import { BaseMgr } from "./BaseMgr";
import { FightMgr } from "./FightMgr";
import { mgr } from "./mgr";
import { PlayerDataMgr } from "./PlayerDataMgr";



export class GameDataMgr extends BaseMgr {
    // 当前游戏模式
    getCurrentMode(): GameMode{
        if(mgr.getMgr(FightMgr).hasFightInfo) {
            return GameMode.Fight;
        }
        return GameMode.Normal;
    };

    getBGM():string {
        switch (this.getCurrentMode()) {
            case GameMode.Fight:
                return "sounds/music/battle_music";
            case GameMode.Observe:
                return "sounds/music/home_music";
        }
        return "sounds/music/home_music"
    }

    getMapData() {
        switch (this.getCurrentMode()) {
            case GameMode.Normal:
                return mgr.getMgr(PlayerDataMgr).map;
            case GameMode.Fight:
                return mgr.getMgr(FightMgr).mapData;
            case GameMode.Observe:
                return mgr.getMgr(PlayerDataMgr).map;
        }
    }
}

