/*
 * Created: 2022-03-08 10:03:36
 * Author : fc
 * Description: 建筑物信息
 */



import { GameContext } from "../misc/GameContext";
import { LogicTileType, DrawTileGroundType, BuildComeFrom, GameZIndex, UnitType } from "../const/enums";
import { GameEvent } from "../misc/GameEvent";
import { GameUnit } from "./GameUnit";
import GameBuildRender from "./GameBuildRender";
import { RenderUtil } from "../../core/utils/RenderUtil";
import { UnitFollow } from "../ui/UnitFollow";
import { mgr } from "../../manager/mgr";
import { GameCfgMgr } from "../../manager/GameCfgMgr";
import { PlayerMapUnit } from "../../shared/protocols/base";
import { GameDefine } from "../const/GameDefine";
import { BuildingItem } from "../../imports/config/Cfg_Building";

const {ccclass, property} = cc._decorator;


@ccclass()
export class GameBuild extends cc.Component {

    //////////////////////////////////////////////////////////
    /// 对其他组件的引用
    // GameUnit
    unit: GameUnit = null;
    // 渲染组件
    render: GameBuildRender = null;

    // 建筑物地面渲染节点
    buildGround: cc.Node = null;
    //////////////////////////////////////////////////////////

    // 地面绘制类型
    drawTileGroundType : DrawTileGroundType = DrawTileGroundType.Normal;

    // 聚焦前的逻辑坐标
    lastLogicPos: cc.Vec2 = new cc.Vec2();
    // 拖拽开始时的逻辑坐标
    dragStartLogicPos: cc.Vec2 = new cc.Vec2(0, 0);
    // 建筑配置id
    cfgId: number = 0;
    // 建筑配置
    buildCfg: BuildingItem;
    // 当前等级
    lv: number = 0;
    // unitUUID
    unitUUID: string = "";

    // 该建筑物来自哪儿
    comeFrom: BuildComeFrom = BuildComeFrom.MAP;

    // 建筑资源URL缓存
    cacheBuildResource: string = "";

    
    protected onLoad(): void {
        this.unit = this.addComponent(GameUnit);
        this.unit.type = UnitType.Buildings;

        this.render = this.addComponent(GameBuildRender)

        this.buildGround = this.node.getChildByName("build_ground");
        this.buildGround.removeFromParent();
        GameContext.getInstance().gameLayer.addFollow(GameZIndex.LawnLayer, this.buildGround, this.node, this.buildGround.position as any);

        let eventEmitter = GameContext.getInstance().eventEmitter;
        eventEmitter.on(GameEvent.ON_NTF_FOCUS_UNIT, this.onEventFocusUnit, this);
        eventEmitter.on(GameEvent.ON_NTF_UNFOCUS_UNIT, this.onEventUnFocusUnit, this);
        eventEmitter.on(GameEvent.ON_NTF_DRAG_UNIT_START, this.onEventDragUnitStart, this);
        eventEmitter.on(GameEvent.ON_NTF_DRAG_UNIT, this.onEventDragUnit, this);
    }

    protected onDestroy(): void {
        this.unit = null;
        this.render = null;
        GameContext.getInstance().eventEmitter.removeAllListenerByContext(this);        
    }

    initWithBuildData(data: PlayerMapUnit, comeFrom: BuildComeFrom) {
        this.cfgId = data.id;
        this.unitUUID = data.uuid;
        this.lv = data.lv;
        this.comeFrom = comeFrom;
        this.buildCfg  = mgr.getMgr(GameCfgMgr).getData("Building", this.cfgId);

        this.unit.x = data.x;
        this.unit.y = data.y;
        this.unit.xCount = this.buildCfg.XCount;
        this.unit.yCount = this.buildCfg.YCount;
        this.unit.flags.length = this.unit.xCount * this.unit.yCount;

        for(let y = 0; y < this.unit.yCount; ++y){
            for(let x = 0; x < this.unit.xCount; ++x){
                this.unit.flags[x + y * this.unit.xCount] = this.buildCfg.Flags[y][x];
            }
        }

        this.syncData();
    }

    syncData() {
        this.unit.updateFlags();
        // 渲染更新
        this.render.updateRender();
        
        // 节点偏移设置
        const algorithm = GameContext.getInstance().logicTileAlgorithm;
        let pos = algorithm.calculateMapTilePos(this.unit.x, this.unit.y);
        this.node.setPosition(pos.x - algorithm.TILE_WIDTH_HALF * this.buildCfg.XCount, pos.y - algorithm.TILE_HEIGHT_HALF);

        this.updateBuildingGround();

        GameContext.getInstance().eventEmitter.emit(GameEvent.DO_UPDATE_SORT);
    }

    
    /**
     * 更新地面是否有效
     */
    updateTileGroundValid() {
        let type = DrawTileGroundType.Invalid;
        if(GameContext.getInstance().canPlace(this.unit))
            type = DrawTileGroundType.Effective;
        else
            type = DrawTileGroundType.Invalid;

        if(type == this.drawTileGroundType) {
            return;
        }
        this.drawTileGroundType = type;
        this.updateBuildingGround();
    }


    touchTest(pos: cc.Vec2) {
        let logicPos = GameContext.getInstance().logicTileAlgorithm.calculateLogicPos(pos.x, pos.y);
        return this.unit.containLogicPos(logicPos);
    }

    /**
     * 是否允许点击其他unit来让自己失焦
     * @param newUnit 
     */
    canUnFocusOnClickOtherUnit(newUnit: GameUnit): boolean {
        // 当前焦点元素是新建的，不允许点击其他元素将其失焦
        if(this.comeFrom != BuildComeFrom.MAP) {
            return false;
        }
        return true;
    }


    isSelfUnit(unit: GameUnit): boolean {
        return unit.node === this.node;
    }
    
    onEventFocusUnit(unit: GameUnit) {
        if(!this.isSelfUnit(unit)){
            return;
        }
        
        this.lastLogicPos.x = this.unit.x;
        this.lastLogicPos.y = this.unit.y;

        GameContext.getInstance().delUnit(this.unit);
        
        this.render.runFocusAction();
    }


    /**
     * 失去焦点
     * @param unit 
     * @param compulsive 是否是强制失焦
     * @param discardModify 是否放弃此次修改
     * @returns 
     */
    onEventUnFocusUnit(unit: GameUnit, compulsive: boolean, discardModify: boolean) {
        if(!this.isSelfUnit(unit)){
            return;
        }
        
        GameContext.getInstance().eventEmitter.emit(GameEvent.ON_NTF_SET_ZINDEX_NODE, null);

        // 如果该位置无法放置，则强制放弃修改
        if(!GameContext.getInstance().canPlace(this.unit)) {
            discardModify = true;
            cc.warn("此位置无法放置，强制取消");
        }


        switch(this.comeFrom) {
            case BuildComeFrom.MAP:{
                // 放弃此次修改
                if(discardModify) {
                    // 还原坐标
                    this.unit.x = this.lastLogicPos.x;
                    this.unit.y = this.lastLogicPos.y;
                }

                this.drawTileGroundType = DrawTileGroundType.Normal;
                this.syncData();
                GameContext.getInstance().addUnit(this.unit);
                GameContext.getInstance().eventEmitter.emit(GameEvent.DO_SAVA_MAP);
                break;
            }
            // 来自仓库/商店
            case BuildComeFrom.WAREHOUSE:
            case BuildComeFrom.SHOP:
                {
                // 只接受强制失焦
                if(!compulsive) {
                    GameContext.getInstance().eventEmitter.emit(GameEvent.DO_BREAK_UNFOCUS);
                    return;
                }

                // 放弃此次修改
                if(discardModify) {
                    // 删除建筑
                    GameContext.getInstance().eventEmitter.emit(GameEvent.DO_DEL_UNIT, this.node);
                }
                else {
                    this.comeFrom = BuildComeFrom.MAP;
                    this.drawTileGroundType = DrawTileGroundType.Normal;
                    this.syncData();
                    GameContext.getInstance().addUnit(this.unit);
                    GameContext.getInstance().eventEmitter.emit(GameEvent.DO_SAVA_MAP);
                }
                break;
            }
        }

        this.render.stopFocusAction();
    }

    onEventDragUnitStart(unit: GameUnit) {
        if(!this.isSelfUnit(unit)){
            return;
        }
        
        this.dragStartLogicPos.x = this.unit.x;
        this.dragStartLogicPos.y = this.unit.y;
    }

    onEventDragUnit(unit: GameUnit, distance: cc.Vec2) {
        if(!this.isSelfUnit(unit)){
            return;
        }

        // 计算出逻辑移动偏移
        let logicOffset = GameContext.getInstance().logicTileAlgorithm.calculateLogicPos(distance.x, distance.y);
        logicOffset.x = Math.floor(logicOffset.x / GameDefine.LOGIC_SCALE) * GameDefine.LOGIC_SCALE;
        logicOffset.y = Math.floor(logicOffset.y / GameDefine.LOGIC_SCALE) * GameDefine.LOGIC_SCALE;
        if(logicOffset.x == 0 && logicOffset.y == 0) {
            return;
        }
        
        const oldx = this.unit.x;
        const oldy = this.unit.y;
        const maxX = GameDefine.LOGIC_X_COUNT - this.unit.xCount;
        const maxY = GameDefine.LOGIC_Y_COUNT - this.unit.yCount;

        this.unit.x = this.dragStartLogicPos.x - logicOffset.x;
        this.unit.y = this.dragStartLogicPos.y - logicOffset.y;

        // 范围限制,防止跑出地图
        this.unit.x = Math.max(this.unit.x, 0);
        this.unit.y = Math.max(this.unit.y, 0);
        this.unit.x = Math.min(this.unit.x, maxX);
        this.unit.y = Math.min(this.unit.y, maxY);

        // 数据同步
        if(oldx !== this.unit.x || oldy !== this.unit.y) {
            this.syncData();
            this.updateTileGroundValid();
        }

        // 移动时将焦点对象的Z值设为最大
        this.node.zIndex = cc.macro.MAX_ZINDEX;
        GameContext.getInstance().eventEmitter.emit(GameEvent.ON_NTF_SET_ZINDEX_NODE, this.node);
    }




    
    /**
     * 更新建筑地面纹理
    */
     updateBuildingGround(){         
        RenderUtil.setNodeVisible(this.buildGround, this.drawTileGroundType !== DrawTileGroundType.None);
        // 不显示地面背景
        if(this.drawTileGroundType == DrawTileGroundType.None) {
            return;
        }

        let tag = "";
        if(this.drawTileGroundType == DrawTileGroundType.Effective) {
            tag = "yes_";
        }
        else if(this.drawTileGroundType == DrawTileGroundType.Invalid) {
            tag = "no_";
        }

        const algorithm = GameContext.getInstance().logicTileAlgorithm;
        
        // 渲染格子要比逻辑格子大一些
        const renderCountX = Math.floor(this.unit.xCount / GameDefine.LOGIC_SCALE);
        const renderCountY = Math.floor(this.unit.yCount / GameDefine.LOGIC_SCALE);

        let url = `build_${renderCountX}_${renderCountY}_${tag}hd`;            
        cc.resources.load("common/build_num_num_hd", cc.SpriteAtlas, (err: any, atlas : cc.SpriteAtlas) => {
            this.buildGround.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(url);
        });
        
        let distance = new cc.Vec2(this.unit.xCount * algorithm.TILE_WIDTH / GameDefine.LOGIC_SCALE, this.unit.yCount * algorithm.TILE_HEIGHT / GameDefine.LOGIC_SCALE);
        this.buildGround.getComponent(UnitFollow).followDistance = distance;
    }
}
