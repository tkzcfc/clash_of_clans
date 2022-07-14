/*
 * Created: 2022-03-25 16:47:47
 * Author : fc
 * Description: 游戏层
 */

import { EventEmitter } from "../core/common/event/EventEmitter";
import { ZoomView } from "./ui/ZoomView";
import { BuildComeFrom, DrawTileMode, GameMode, GameZIndex, UnitType } from "./const/enums";
import { UnitSort } from "./algorithm/UnitSort";
import { GameBuild } from "./unit/GameBuild";
import { GameContext } from "./misc/GameContext";
import { GameEvent } from "./misc/GameEvent";
import { GameUnit } from "./unit/GameUnit";
import { UnitFollow } from "./ui/UnitFollow";
import { BaseControl } from "./control/BaseControl";
import { mgr } from "../manager/mgr";
import { FightControl } from "./control/FightControl";
import { HomeControl } from "./control/HomeControl";
import { GameRole } from "./unit/GameRole";
import { PlayerMap, PlayerMapUnit, PlayerSimpleMap } from "../shared/protocols/base";
import { Pathfinding } from "./misc/Pathfinding";
import { ObserveControl } from "./control/ObserveControl";
import { GameDataMgr } from "../manager/GameDataMgr";

const {ccclass, property} = cc._decorator;

const TypeofControl = {
    [GameMode.Normal] : HomeControl,
    [GameMode.Fight] : FightControl,
    [GameMode.Observe] : ObserveControl,    
}

@ccclass()
export class GameLayer extends cc.Component {
    // 地图预制体
    @property(cc.Prefab)
    mapPrefab: cc.Prefab = null;
    
    // 建筑物预制体
    @property(cc.Prefab)
    buildPrefab: cc.Prefab = null;

    // 角色预制体
    @property(cc.Prefab)
    rolePrefab: cc.Prefab = null;

    // scrollView
    @property(cc.ScrollView)
    mapScrollView: cc.ScrollView = null;

    // 绘制格子节点（调试使用）
    drawTiled: cc.Node = null;

    // 层级节点
    layers: cc.Node[] = [];

    // 控制器
    control: BaseControl;

    // 是否启用调试绘制
    set enableDebugDraw(value) {
        this._enableDebugDraw = value;
        this.updateDebugDraw();
    }
    get enableDebugDraw() {
        return this._enableDebugDraw;
    }
    _enableDebugDraw: boolean = false;


    // 地图中的所有单位
    units: GameUnit [] = [];
    // 地图中的所有建筑
    builds: GameBuild[] = [];

    // 游戏内部事件派发器
    eventEmitter: EventEmitter<GameEvent>;

    // 排序脏标记
    _sortDirty: boolean = false;
    
    ///////////////////// 触摸相关 /////////////////////
    // 记录触摸开始的touchid,保证多点触摸时其他触摸无效
    _touchStartID: number = Number.MAX_SAFE_INTEGER;
    // 当前触摸对象
    _curTouchUnit: GameUnit;
    // 当前编辑焦点对象
    _focusUnit: GameUnit;
    // 当前设置最大Zindex的节点
    _maxZIdxNode: cc.Node;

    // ZoomView
    _zoomView: ZoomView;

    // 是否中断此次失焦
    breakThisUnFocus: boolean = false;

    protected onLoad(): void {
        GameContext.destroy();
        GameContext.getInstance().gameLayer = this;
        Pathfinding.reset();
        this.eventEmitter = GameContext.getInstance().eventEmitter;

        let mapw = GameContext.getInstance().TILE_WIDTH * GameContext.getInstance().X_COUNT;
        let maph = GameContext.getInstance().TILE_HEIGHT * GameContext.getInstance().Y_COUNT;

        // 实例化地图
        let mapRenderNode = cc.instantiate(this.mapPrefab);

        let unitRootNode = mapRenderNode.getChildByName("unitRootNode");
        let rootPos = unitRootNode.position;
        let anchor = unitRootNode.getAnchorPoint();
        unitRootNode.destroy();

        // 格子绘制节点
        this.drawTiled = mapRenderNode.getChildByName("drawTiled");
        this.drawTiled.setPosition(rootPos.x - mapw * 0.5, rootPos.y);

        // 添加层级节点
        for(let i = 0; i < GameZIndex.Count; ++i) {
            let layer = new cc.Node();
            layer.zIndex = i;
            layer.setContentSize(mapw, maph);
            layer.setAnchorPoint(anchor);
            layer.setPosition(rootPos);
            layer.parent = mapRenderNode;
            this.layers[i] = layer;
        }
        
        // 将地图添加到滚动层中
        this.mapScrollView.content.addChild(mapRenderNode);
        this.mapScrollView.content.setPosition(0, 0);

        // 手势缩放
        this._zoomView = this.addComponent(ZoomView);
        this._zoomView.contentNode = mapRenderNode;
        this._zoomView.scrollView = this.mapScrollView;

        this.initEvent();

        // BGM
        cc.resources.load(mgr.getMgr(GameDataMgr).getBGM(), cc.AudioClip, (err, audio: cc.AudioClip)=> {
            if(!!err) {
                return;
            }
            cc.audioEngine.playMusic(audio, true);
        });

        this.control = new TypeofControl[mgr.getMgr(GameDataMgr).getCurrentMode()]();
        this.control.initialize(this);
        
        this.reloadMap(mgr.getMgr(GameDataMgr).getMapData());
    }

    protected onDestroy(): void {
        this.eventEmitter.removeAllListenerByContext(this);
        cc.audioEngine.stopMusic();
    }

    protected lateUpdate(dt: number): void {
        if(this._sortDirty) {
            this._sortDirty = false;
            this.units = UnitSort.doSort(this.units, 1);

            if(this._maxZIdxNode) {
                this._maxZIdxNode.zIndex = cc.macro.MAX_ZINDEX;
            }
        }
        Pathfinding.update();
    }

    reloadMap(mapData: PlayerMap | PlayerSimpleMap) {
        this.units.forEach((item: GameUnit)=>{
            item.node.destroy();
        });
        this.units.length = 0;
        this.builds.length = 0;

        GameContext.getInstance().clearTileData();

        this.enableDebugDraw = false;

        
        mapData.units.forEach((data)=>{
            this.newBuild(data, BuildComeFrom.MAP);
        });

        // this.enableDebugDraw = true;

        this._sortDirty = true;
    }
    
    /**
     * 创建建筑
     * @param data 
     */
    newBuild(data: PlayerMapUnit, comeFrom: BuildComeFrom): cc.Node {
        let node = cc.instantiate(this.buildPrefab);
        node.parent = this.layers[GameZIndex.UnitLayer];
                
        let build = node.addComponent(GameBuild);
        build.initWithBuildData(data, comeFrom);
        this.builds.push(build);
        
        this.units.push(node.getComponent(GameUnit));

        GameContext.getInstance().addBuild(build);
        return node;
    }

    delBuild(build: GameBuild) {
        GameContext.getInstance().delBuild(build);

        for(let i = 0, j = this.builds.length; i < j; ++i) {
            if(this.builds[i] === build) {
                this.builds.splice(i, 1);
                break;
            }
        }
        for(let i = 0, j = this.units.length; i < j; ++i) {
            if(this.units[i].node === build.node) {
                this.units.splice(i, 1);
                break;
            }
        }

        this.removeAllFollowByTarget(build.node);
        build.node.destroy();
    }
    
    newRole(id: number, lv: number, x: number, y: number) {
        let node = cc.instantiate(this.rolePrefab);
        node.parent = this.layers[GameZIndex.UnitLayer];

        let role = node.addComponent(GameRole);
        role.initRole(id, lv, x, y);

        this.units.push(node.getComponent(GameUnit));
    }

    initEvent() {
        // 触摸事件订阅
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event)=>{
            if(!event.simulate) {
                this.onTouchEnd(event);
            }
        }, this, true);

        // 游戏内部事件订阅
        let eventEmitter = GameContext.getInstance().eventEmitter;
        eventEmitter.on(GameEvent.ON_NTF_CLICK_EMPTY, this.onEventClickEmpty, this);
        eventEmitter.on(GameEvent.ON_NTF_CLICK_UNIT, this.onEventClickUnit, this);
        eventEmitter.on(GameEvent.ON_NTF_LONG_TOUCH_UNIT, this.onEventLongTouchUnit, this);
        eventEmitter.on(GameEvent.ON_NTF_UPDATE_TILE_DATA, this.onEventUpdateTileData, this);

        eventEmitter.on(GameEvent.ON_NTF_SET_ZINDEX_NODE, (maxZIdxNode)=>{
            this._maxZIdxNode = maxZIdxNode;
        }, this);
        
        eventEmitter.on(GameEvent.DO_FOCUS_UNIT, this.onDoFocusUnit, this);
        eventEmitter.on(GameEvent.DO_UNFOCUS_UNIT, this.onDoUnFocusUnit, this);

        // 中断失焦
        eventEmitter.on(GameEvent.DO_BREAK_UNFOCUS, ()=>{
            this.breakThisUnFocus = true;
        }, this);

        // 删除
        eventEmitter.on(GameEvent.DO_DEL_UNIT, this.onDoDelUnit, this);
        // 重新对地图中的元素排序
        eventEmitter.on(GameEvent.DO_UPDATE_SORT, ()=>{
            this._sortDirty = true;
        }, this);
    }
    
    onTouchStart(event) {
        cc.log("onTouchStart begin");
        if(this._touchStartID !== Number.MAX_SAFE_INTEGER) {
            return;
        }
        this._touchStartID = event.touch.getID();
        this._curTouchUnit = null;

        do
        {
            // 焦点元素触摸判定放在最前面
            if(this._focusUnit && this._focusUnit.touchTest(event)) {
                this._focusUnit.onTouchStart(event);
                this._curTouchUnit = this._focusUnit;                
                break;
            }

            for(let i = 0, j = this.units.length; i < j; ++i) {
                let unit = this.units[i].getComponent(GameUnit);
                if(this._focusUnit != unit && unit.touchTest(event)) {
                    unit.onTouchStart(event);
                    this._curTouchUnit = unit;
                    break;
                }
            }
        }
        while(false);

        if(this._curTouchUnit && this._focusUnit === this._curTouchUnit) {
            this.eventEmitter.emit(GameEvent.ON_NTF_DRAG_UNIT_START, this._focusUnit);
        }
    }

    onTouchMove(event) {
        cc.log("onTouchMove ====>");
        if(this._zoomView.touchNum() > 1 || this._touchStartID !== event.touch.getID()) {
            return;
        }

        if(this._curTouchUnit) {
            this._curTouchUnit.onTouchMove(event);
        }

        if(this._focusUnit && this._focusUnit === this._curTouchUnit) {
            this._focusUnit.onDragFocusUnit(event);
            event.stopPropagation();
            event.stopPropagationImmediate();    
        }
    }

    onTouchEnd(event) {
        cc.log("onTouchMove ====>");
        if(this._touchStartID !== event.touch.getID()) {
            return;
        }
        this._touchStartID = Number.MAX_SAFE_INTEGER;
        
        let start = event.touch.getStartLocation();
        let cur = event.touch.getLocation();
        let distance = new cc.Vec2(start.x - cur.x, start.y - cur.y);

        if(this._curTouchUnit) {
            this._curTouchUnit.onTouchEnd(event);
        }
        else {
            if(distance.lengthSqr() < 16) {
                this.eventEmitter.emit(GameEvent.ON_NTF_CLICK_EMPTY, cur);
            }
        }
    }
    
    // 点击空白处
    onEventClickEmpty() {
        this.eventEmitter.emit(GameEvent.DO_UNFOCUS_UNIT, false, false);
    }
    
    // 点击单元
    onEventClickUnit(unit: GameUnit) {
        if(this._focusUnit == unit || this._zoomView.touchNum() > 1 || !this.control.canFocusOnClickUnit()) {
            return;
        }

        if(unit.type == UnitType.buildings) {                
            if(this._focusUnit) {
                if(!this._focusUnit.getComponent(GameBuild).canUnFocusOnClickOtherUnit(unit)) {
                    return;
                }
                this.eventEmitter.emit(GameEvent.DO_UNFOCUS_UNIT, false, false);
            }
            this.eventEmitter.emit(GameEvent.DO_FOCUS_UNIT, unit);
        }
    }
 
    // 长按单元
    onEventLongTouchUnit(unit: GameUnit) {
        if(this._focusUnit == unit) {
            return;
        }
        
        if(unit.type == UnitType.buildings) {
            if(!this._focusUnit && this._zoomView.touchNum() <= 1)
                this.eventEmitter.emit(GameEvent.DO_FOCUS_UNIT, unit);
        }
    }

    // 更新地图数据
    onEventUpdateTileData() {
        this.updateDebugDraw();
    }

    // 让某个单元成为焦点单元
    onDoFocusUnit(focusUnit: GameUnit) {
        // 强制失焦，且放弃此次修改
        if(this._focusUnit) {
            this.eventEmitter.emit(GameEvent.DO_UNFOCUS_UNIT, true, true);
        }
        
        this._focusUnit = focusUnit;
        this.eventEmitter.emit(GameEvent.ON_NTF_FOCUS_UNIT, this._focusUnit);
        this.eventEmitter.emit(GameEvent.ON_NTF_DRAG_UNIT_START, this._focusUnit);
    }

    /**
     * 取消当前焦点单元
     * @param compulsive 是否是强制失焦
     * @param discardModify 是否放弃此次修改
     * @returns 
     */
    onDoUnFocusUnit(compulsive: boolean, discardModify: boolean) {
        if(!this._focusUnit)
            return;

        this.breakThisUnFocus = false;

        this.eventEmitter.emit(GameEvent.ON_NTF_UNFOCUS_UNIT, this._focusUnit, !!compulsive, !!discardModify);

        // 强制失焦无法中断
        if(this.breakThisUnFocus && !compulsive) {
            return;
        }
        this._focusUnit = null;
    }

    onDoDelUnit(unitNode: cc.Node) {
        if(unitNode.getComponent(GameUnit).type === UnitType.buildings) {
            this.delBuild(unitNode.getComponent(GameBuild));
        }
        else{
            console.assert(false);
        }
    }

    updateDebugDraw() {
        this.drawTiled.active = this.enableDebugDraw;

        if(!this.enableDebugDraw) {
            this.layers.forEach((layer: cc.Node)=>{
                layer.opacity = 255;
            });
            return;
        }

        this.layers.forEach((layer: cc.Node)=>{
            layer.opacity = 100;
        });

        let g = this.drawTiled.getComponent(cc.Graphics);
        GameContext.getInstance().drawMapTile(g, DrawTileMode.ShowRenderTile);
    }


    /**
     * 添加跟随节点
     * @param layerIndex 节点层级
     * @param node 跟随节点
     * @param target 目标节点
     * @param followDistance 跟随距离
     */
    addFollow(layerIndex: GameZIndex, node: cc.Node, target: cc.Node, followDistance: cc.Vec2) {
        let follow = node.getComponent(UnitFollow);
        if(!follow) {
            follow = node.addComponent(UnitFollow);
        }
        follow.initFollow(target, followDistance);
        this.layers[layerIndex].addChild(node);
    }

    removeAllFollowByTarget(target: cc.Node) {
        let follows = [];

        this.layers.forEach((layer: cc.Node)=>{
            layer.children.forEach((node: cc.Node)=>{
                let follow = node.getComponent(UnitFollow);
                if(follow && follow.followTarget === target) {
                    follows.push(node);
                }
            });
        });

        follows.forEach((node)=>{
            node.destroy();
        });
    }
}
