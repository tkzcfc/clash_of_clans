import { BuildComeFrom, GameZIndex } from "../../logic/common/enums";
import { PlayerData } from "../../logic/data/PlayerData";
import { GameLayer } from "../GameLayer";
import { GameContext } from "../misc/GameContext";
import { GameEvent } from "../misc/GameEvent";
import { BuildInfo } from "../unit/BuildInfo";
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
        let mapItems = [];
        this.gameLayer.builds.forEach((build: BuildInfo)=>{
            mapItems.push({
                id: build.cfgId,
                lv: build.lv,
                x: build.unit.transform.x,
                y: build.unit.transform.y,     
            });
        });

        PlayerData.getInstance().mapData.setItems(mapItems);
        PlayerData.getInstance().sendMdfUnimportantData();
    }
    
}