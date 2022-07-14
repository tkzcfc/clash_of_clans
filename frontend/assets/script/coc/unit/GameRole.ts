/*
 * Created: 2022-04-02 17:22:01
 * Author : fc
 * Description: 角色基类
 */

import GameRoleDynamicClip from "./GameRoleDynamicClip";
import { GameUnit } from "./GameUnit";
import { GameContext } from "../misc/GameContext";
import { GameEvent } from "../misc/GameEvent";
import { GameUtils } from "../misc/GameUtils";
import { mgr } from "../../manager/mgr";
import { GameCfgMgr } from "../../manager/GameCfgMgr";
import { Pathfinding } from "../misc/Pathfinding";
import { UnitType } from "../const/enums";

const {ccclass, property} = cc._decorator;

@ccclass
export class GameRole extends cc.Component {
    // 动画
    dynamicClip: GameRoleDynamicClip;

    ///////////////// 寻路相关 /////////////////
    // 移动点合集
    walkPosArray: cc.Vec2[] = [];
    // 当前移动路径下标
    walkIndex: number = 0;

    // 缓动执行类
    moveTween: cc.Tween<cc.Node> = null;
    // 逻辑坐标
    position: cc.Vec2 = new cc.Vec2();
    

    protected onLoad(): void {
        let unit = this.addComponent(GameUnit)
        unit.type = UnitType.Role;

        this.addComponent(GameRoleDynamicClip);

        setTimeout(()=>{
            this.gotoRandomBuild();
        }, 1000);
    }

    initRole(id: number, lv: number, x: number, y: number) {
        let cfg = mgr.getMgr(GameCfgMgr).getData("Role", id.toString());
        
        this.dynamicClip = this.getComponent(GameRoleDynamicClip);
        this.dynamicClip.actName = "stand";
        this.dynamicClip.loadClip(`${cfg.Resource}_lv${lv}`, [
            "attack1",
            "run",
            "stand",
            "win",
        ]);

        this.setPosition(x, y);
    }

    /**
     * 
     * @param x 逻辑坐标X
     * @param y 逻辑坐标Y
     * @param noSyncRender 不同步渲染坐标 
     */
    setPosition(x: number, y: number, noSyncRender: boolean = false) {
        this.position.x = x;
        this.position.y = y;

        this.getComponent(GameUnit).logicTransform.x = x;
        this.getComponent(GameUnit).logicTransform.y = y;
        GameContext.getInstance().eventEmitter.emit(GameEvent.DO_UPDATE_SORT);

        if(!noSyncRender) {
            let pos = GameContext.getInstance().logicTileAlgorithm.calculateMapTilePos(x, y);
            this.node.position = new cc.Vec3(pos.x, pos.y, 0.0);
        }
    }

    getPosition() {
        return this.position;
    }

    gotoRandomBuild() {
        const builds = GameContext.getInstance().gameLayer.builds;
        const build = builds[GameUtils.randomRangeInt(0, builds.length - 1)];

        if(build) {
            this.goto(build.getComponent(GameUnit));
        }
        else {
            cc.tween(this.node)
            .delay(1)
            .call(this.gotoRandomBuild, this)
            .start();
        }
    }

    async goto(unit: GameUnit) {
        // 重置寻路相关参数
        Pathfinding.cancel(this);
        if(this.moveTween) {
            this.moveTween.stop();
        }

        const selfTransform = this.getComponent(GameUnit).logicTransform;
        const targetTransform = unit.logicTransform;

        const from = new cc.Vec2(selfTransform.x, selfTransform.y);
        const to = new cc.Vec2(targetTransform.x, targetTransform.y);

        this.walkPosArray = await Pathfinding.runAsync(from, to, (x: number, y: number)=>{
            if(unit.containLogicPosEx(unit.logicTransform, x, y)) {
                return true;
            }
            return GameContext.getInstance().canWalk(x, y);
        }, this);

        // 寻路被中断
        if(!this.walkPosArray) {
            return;
        }

        // 寻路失败，无法到达目标点
        if(this.walkPosArray.length <= 0) {
            this.dynamicClip.actName = "stand";
            this.dynamicClip.updatePlay();
            this.moveTween = cc.tween(this.node)
                .delay(3)
                .call(this.gotoRandomBuild, this)
                .start();
            return;
        }

        this.doStep();
    }

    doStep() {
        this.walkIndex++;
        if(this.moveTween) {
            this.moveTween.stop();
        }

        let doWalk = false;
        do
        {
            if(this.walkIndex >= this.walkPosArray.length) {
                break;
            }

            let pos = this.walkPosArray[this.walkIndex];
            if(false == GameContext.getInstance().canWalk(pos.x, pos.y)){
                break;
            }
            
            doWalk = true;
            this.stepWalk(pos);
        }while(false);
        
        if(false == doWalk) {
            let pos = this.walkPosArray[this.walkPosArray.length - 1];
            this.dynamicClip.direction = GameUtils.getRoleDirection(this.getComponent(GameUnit).logicTransform, pos);
            this.dynamicClip.actName = "attack1";
            this.dynamicClip.updatePlay();
            this.moveTween = cc.tween(this.node)
                .delay(3)
                .call(this.gotoRandomBuild, this)
                .start();
        }
    }

    stepWalk(to: cc.Vec2) {
        // 更新角色朝向
        this.dynamicClip.direction = GameUtils.getRoleDirection(this.getComponent(GameUnit).logicTransform, to);
        this.dynamicClip.actName = "run";
        this.dynamicClip.updatePlay();

        this.setPosition(to.x, to.y, true);
        
        let renderPos = GameContext.getInstance().logicTileAlgorithm.calculateMapTilePos(to.x, to.y);
        let toPos = new cc.Vec3(renderPos.x, renderPos.y, 0.0);
        let length = this.node.position.sub(toPos).len();

        this.moveTween = cc.tween(this.node)
            .to(length / 70, {position: toPos})
            .call(this.doStep, this)
            .start();
    }
}

