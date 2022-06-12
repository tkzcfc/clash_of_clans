/*
 * Created: 2022-03-08 10:03:36
 * Author : fc
 * Description: 建筑物信息
 */



import { GameContext } from "../misc/GameContext";
import { UnitType, DrawTileGroundType, BuildComeFrom, GameZIndex } from "../../logic/common/enums";
import { GameCfgKey } from "../../common/config/GameCfgKey";
import { GameEvent } from "../misc/GameEvent";
import { UnitInfo } from "./UnitInfo";
import BuildRender from "./BuildRender";
import { RenderUtil } from "../../core/utils/RenderUtil";
import { UnitFollow } from "../misc/UnitFollow";
import { mgr } from "../../logic/manager/mgr";
import { GameCfgMgr } from "../../logic/manager/GameCfgMgr";

const {ccclass, property} = cc._decorator;


@ccclass()
export class BuildInfo extends cc.Component {

    //////////////////////////////////////////////////////////
    /// 对其他组件的引用
    // UnitInfo
    unit: UnitInfo = null;
    // 渲染组件
    render: BuildRender = null;

    // 建筑物地面渲染节点
    buildGround: cc.Node = null;
    //////////////////////////////////////////////////////////

    // 建筑类型
    unitType : UnitType = UnitType.buildings;
    // 地面绘制类型
    drawTileGroundType : DrawTileGroundType = DrawTileGroundType.Normal;

    // 聚焦前的逻辑坐标
    lastLogicPos: cc.Vec2 = new cc.Vec2();
    // 拖拽开始时的逻辑坐标
    dragStartLogicPos: cc.Vec2 = new cc.Vec2(0, 0);
    // 建筑配置id
    cfgId: string = "0";
    // 建筑配置
    buildCfg: any;
    // 当前等级
    lv: number = 0;

    // 该建筑物来自哪儿
    comeFrom: BuildComeFrom = BuildComeFrom.MAP;

    // 建筑资源URL缓存
    cacheBuildResource: string = "";

    
    protected onLoad(): void {
        this.render = this.getComponent(BuildRender);
        this.unit = this.getComponent(UnitInfo);

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

    initWithBuildData(cfgId, lv: number, x: number, y: number, comeFrom: BuildComeFrom) {
        let buildCfg = mgr.getMgr(GameCfgMgr).getData(GameCfgKey.Building, cfgId);

        this.buildCfg = buildCfg;
        this.cfgId = cfgId;
        this.lv = lv;
        this.comeFrom = comeFrom;

        this.unit.transform.x = x;
        this.unit.transform.y = y;
        this.unit.transform.xCount = buildCfg.XCount;
        this.unit.transform.yCount = buildCfg.YCount;
        this.unit.transform.subdivide(this.unit.logicTransform);

        this.syncData();
    }

    syncData() {
        // 渲染更新
        this.render.updateRender();
        
        // 节点偏移设置
        const algorithm = GameContext.getInstance().tileAlgorithm;
        let pos = algorithm.calculateMapTilePos(this.unit.transform.x, this.unit.transform.y);
        this.node.setPosition(pos.x - algorithm.TILE_WIDTH_HALF * this.buildCfg.XCount, pos.y - algorithm.TILE_HEIGHT_HALF);

        this.updateBuildingGround();

        GameContext.getInstance().eventEmitter.emit(GameEvent.DO_UPDATE_SORT);
    }

    
    /**
     * 更新地面是否有效
     */
    updateTileGroundValid() {
        let type = DrawTileGroundType.Invalid;
        if(GameContext.getInstance().canPlace(this.unit.transform))
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
        let logicPos = GameContext.getInstance().tileAlgorithm.calculateLogicPos(pos.x, pos.y);
        return this.unit.containLogicPos(this.unit.transform, logicPos);
    }

    /**
     * 是否允许点击其他unit来让自己失焦
     * @param newUnit 
     */
    canUnFocusOnClickOtherUnit(newUnit: UnitInfo): boolean {
        // 当前焦点元素是新建的，不允许点击其他元素将其失焦
        if(this.comeFrom != BuildComeFrom.MAP) {
            return false;
        }
        return true;
    }


    isSelfUnit(unit: UnitInfo): boolean {
        return unit.node === this.node;
    }
    
    onEventFocusUnit(unit: UnitInfo) {
        if(!this.isSelfUnit(unit)){
            return;
        }
        
        this.lastLogicPos.x = this.unit.transform.x;
        this.lastLogicPos.y = this.unit.transform.y;

        GameContext.getInstance().delBuild(this);
        
        this.render.runFocusAction();
    }


    /**
     * 失去焦点
     * @param unit 
     * @param compulsive 是否是强制失焦
     * @param discardModify 是否放弃此次修改
     * @returns 
     */
    onEventUnFocusUnit(unit: UnitInfo, compulsive: boolean, discardModify: boolean) {
        if(!this.isSelfUnit(unit)){
            return;
        }
        
        GameContext.getInstance().eventEmitter.emit(GameEvent.ON_NTF_SET_ZINDEX_NODE, null);

        // 如果该位置无法放置，则强制放弃修改
        if(!GameContext.getInstance().canPlace(this.unit.transform)) {
            discardModify = true;
            cc.warn("此位置无法放置，强制取消");
        }


        switch(this.comeFrom) {
            case BuildComeFrom.MAP:{
                // 放弃此次修改
                if(discardModify) {
                    // 还原坐标
                    this.unit.transform.x = this.lastLogicPos.x;
                    this.unit.transform.y = this.lastLogicPos.y;
                    this.unit.transform.subdivide(this.unit.logicTransform);
                }

                this.drawTileGroundType = DrawTileGroundType.Normal;
                this.syncData();
                GameContext.getInstance().addBuild(this);
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
                    GameContext.getInstance().addBuild(this);
                    GameContext.getInstance().eventEmitter.emit(GameEvent.DO_SAVA_MAP);
                }
                break;
            }
        }

        this.render.stopFocusAction();
    }

    onEventDragUnitStart(unit: UnitInfo) {
        if(!this.isSelfUnit(unit)){
            return;
        }
        
        this.dragStartLogicPos.x = this.unit.transform.x;
        this.dragStartLogicPos.y = this.unit.transform.y;
    }

    onEventDragUnit(unit: UnitInfo, distance: cc.Vec2) {
        if(!this.isSelfUnit(unit)){
            return;
        }
        
        let transform = this.unit.transform;
        let oldx = transform.x;
        let oldy = transform.y;

        let logicOffset = GameContext.getInstance().tileAlgorithm.calculateLogicPos(distance.x, distance.y);
        transform.x = this.dragStartLogicPos.x - logicOffset.x;
        transform.y = this.dragStartLogicPos.y - logicOffset.y;

        let maxX = GameContext.getInstance().X_COUNT - transform.xCount;
        let maxY = GameContext.getInstance().Y_COUNT - transform.yCount;

        transform.x = Math.max(transform.x, 0);
        transform.y = Math.max(transform.y, 0);
        transform.x = Math.min(transform.x, maxX);
        transform.y = Math.min(transform.y, maxY);

        if(oldx !== transform.x || oldy !== transform.y) {
            transform.subdivide(this.unit.logicTransform);
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

        const algorithm = GameContext.getInstance().tileAlgorithm;
        const transform = this.unit.transform;

        let newPos = new cc.Vec2(transform.xCount * algorithm.TILE_WIDTH_HALF, transform.yCount * algorithm.TILE_HEIGHT_HALF);
        this.buildGround.getComponent(UnitFollow).followDistance = newPos;
        
        let url = `build_${transform.xCount}_${transform.yCount}_${tag}hd`;            
        cc.resources.load("common/build_num_num_hd", cc.SpriteAtlas, (err: any, atlas : cc.SpriteAtlas) => {
            this.buildGround.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(url);
        });
    }
}
