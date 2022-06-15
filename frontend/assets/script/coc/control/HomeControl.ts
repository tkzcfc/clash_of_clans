import { mgr } from "../../manager/mgr";
import { PlayerDataMgr } from "../../manager/PlayerDataMgr";
import { RpcMgr } from "../../manager/RpcMgr";
import { SaveMapUnit } from "../../shared/protocols/ptl/PtlSaveMapUnits";
import { BuildComeFrom, GameZIndex } from "../const/enums";
import { GameLayer } from "../GameLayer";
import { GameContext } from "../misc/GameContext";
import { GameEvent } from "../misc/GameEvent";
import { Build } from "../unit/Build";
import { UnitInfo } from "../unit/UnitInfo";
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
                eventEmitter.emit(GameEvent.DO_FOCUS_UNIT, node.getComponent(UnitInfo));
            }));

            // 操作ui创建
            cc.resources.load("prefab/game/ui/operationConfirm", cc.Prefab, (err, prefab: cc.Prefab)=>{
                let tileSize = node.getComponent(UnitInfo).getTileSize();
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
        this.gameLayer.builds.forEach((build: Build)=>{
            items.push({
                uuid: build.uuid,
                x: build.unit.transform.x,
                y: build.unit.transform.y,     
            });
        });

        // 更新服务器地图数据
        mgr.getMgr(RpcMgr).callApi("ptl/SaveMapUnits", {
            units: items
        });

        // 更新本地地图数据
        let units = mgr.getMgr(PlayerDataMgr).map.units;
        for(let i = units.length - 1; i >= 0; ++i) {
            let find = false;
            let unit = units[i];

            items.forEach(v=>{
                if(v.uuid == unit.uuid) {
                    find = true;
                    unit.x = v.x;
                    unit.y = v.y;
                }
            });

            if(!find) {
                units.splice(i, 1);
            }
        }
    }
    
}