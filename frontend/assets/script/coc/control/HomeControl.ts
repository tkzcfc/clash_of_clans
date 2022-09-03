/*
 * Created: 2022-06-09 16:32:51
 * Author : fc
 * Description: 普通模式-游戏控制器
 */

import { mgr } from "../../manager/mgr";
import { PlayerDataMgr } from "../../manager/PlayerDataMgr";
import { RpcMgr } from "../../manager/RpcMgr";
import { PlayerMapUnit } from "../../shared/protocols/base";
import { SaveMapUnit } from "../../shared/protocols/ptl/PtlSaveMapUnits";
import { BuildComeFrom, GameZIndex } from "../const/enums";
import { GameLayer } from "../GameLayer";
import { GameContext } from "../misc/GameContext";
import { GameEvent } from "../misc/GameEvent";
import { GameBuild } from "../unit/GameBuild";
import { GameUnit } from "../unit/GameUnit";
import { BaseControl } from "./BaseControl";


export class HomeControl extends BaseControl
{
    initialize(gameLayer: GameLayer): void {
        super.initialize(gameLayer);

        this.initEvent();
    }

    initEvent() {
        // 游戏内部事件订阅
        let eventEmitter = GameContext.getInstance().eventEmitter;
        
        // 创建新的建筑
        eventEmitter.on(GameEvent.DO_NEW_BUILD, (data: any, comeFrom: BuildComeFrom)=>{
            let node = this.gameLayer.newBuild(data, comeFrom);
            
            node.runAction(cc.callFunc(()=>{
                eventEmitter.emit(GameEvent.DO_FOCUS_UNIT, node.getComponent(GameUnit));
            }));

            // 操作ui创建
            cc.resources.load("prefab/game/ui/operationConfirm", cc.Prefab, (err, prefab: cc.Prefab)=>{
                let tileSize = node.getComponent(GameUnit).getTileSize();
                tileSize.x *= 0.5;
                tileSize.y += 50;
                this.gameLayer.addFollow(GameZIndex.UILayer, cc.instantiate(prefab), node, tileSize);
            });
        }, this);

        
        // 保存地图
        eventEmitter.on(GameEvent.DO_SAVA_MAP, this.onDoSaveMap, this);
    }

    
    onDoSaveMap() {
        let items: SaveMapUnit[] = [];
        this.gameLayer.builds.forEach((build: GameBuild)=>{
            items.push({
                uuid: build.unitUUID,
                x: build.unit.x,
                y: build.unit.y,     
            });
        });

        // 更新服务器地图数据
        mgr.getMgr(RpcMgr).callApi("ptl/SaveMapUnits", {
            units: items
        });

        // 更新本地地图数据
        let units: PlayerMapUnit[] = [];
        this.gameLayer.builds.forEach((build: GameBuild)=>{
            units.push({
                uuid: build.unitUUID,
                id: build.unit.config.Id,
                x: build.unit.x,
                y: build.unit.y,
                lv: 1
            });
        });
        mgr.getMgr(PlayerDataMgr).map.units = units;

        // let units = mgr.getMgr(PlayerDataMgr).map.units;
        // for(let i = units.length - 1; i >= 0; ++i) {
        //     let find = false;
        //     let unit = units[i];

        //     items.forEach(v=>{
        //         if(v.uuid == unit.uuid) {
        //             find = true;
        //             unit.x = v.x;
        //             unit.y = v.y;
        //         }
        //     });

        //     if(!find) {
        //         units.splice(i, 1);
        //     }
        // }
    }
    
}