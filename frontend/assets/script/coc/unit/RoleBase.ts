/*
 * Created: 2022-04-02 17:22:01
 * Author : fc
 * Description: 角色基类
 */

import RoleDynamicClip from "./RoleDynamicClip";
import { AStar } from "../algorithm/AStar";
import { UnitInfo } from "./UnitInfo";
import { GameContext } from "../misc/GameContext";
import { GameEvent } from "../misc/GameEvent";
import { GameUtils } from "../misc/GameUtils";
import { mgr } from "../../manager/mgr";
import { GameCfgMgr } from "../../manager/GameCfgMgr";
import { GameCfgKey } from "../../common/config/GameCfgKey";

const {ccclass, property} = cc._decorator;


let astar: AStar = new AStar();;

@ccclass
export class RoleBase extends cc.Component {
    // 动画
    dynamicClip: RoleDynamicClip;

    // 移动点合集
    walkPosArray: cc.Vec2[] = [];
    // 
    walkIndex: number = 0;

    moveTween: cc.Tween<cc.Node> = null;

    position: cc.Vec2 = new cc.Vec2();
    

    protected onLoad(): void {
        setTimeout(()=>{
            this.gotoRandomBuild();
        }, 1000);
    }

    initRole(id: number, lv: number, x: number, y: number) {
        let cfg = mgr.getMgr(GameCfgMgr).getData(GameCfgKey.Role, id.toString());
        
        this.dynamicClip = this.getComponent(RoleDynamicClip);
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

        this.getComponent(UnitInfo).logicTransform.x = x;
        this.getComponent(UnitInfo).logicTransform.y = y;
        GameContext.getInstance().eventEmitter.emit(GameEvent.DO_UPDATE_SORT);

        if(!noSyncRender) {
            let pos = GameContext.getInstance().logicTileAlgorithm.calculateMapTilePos(x, y);
            this.node.position = new cc.Vec3(pos.x, pos.y, 0.0);
        }
    }

    getPosition() {
        return this.position;
    }

    goto(unit: UnitInfo) {
        const logicTileAlgorithm = GameContext.getInstance().logicTileAlgorithm;
        const selfTransform = this.getComponent(UnitInfo).logicTransform;
        const targetTransform = unit.logicTransform;

        const bpos = new cc.Vec2(selfTransform.x, selfTransform.y);
        const epos = new cc.Vec2(targetTransform.x, targetTransform.y);

        this.walkIndex = 0;
        this.walkPosArray = astar.run(logicTileAlgorithm.X_COUNT, logicTileAlgorithm.Y_COUNT, bpos, epos, (x: number, y: number)=>{
            if(unit.containLogicPosEx(unit.logicTransform, x, y)) {
                return true;
            }
            return GameContext.getInstance().canWalk(x, y);
        });
        
        this.step();


        
        // const logicTileAlgorithm = GameContext.getInstance().logicTileAlgorithm;

        // const bpos = new cc.Vec2(10, 10);
        // const epos = new cc.Vec2(20, 0);

        // this.walkIndex = 0;
        // this.walkPosArray = astar.run(logicTileAlgorithm.X_COUNT, logicTileAlgorithm.Y_COUNT, bpos, epos, (x: number, y: number)=>{
        //     return GameContext.getInstance().canWalk(x, y);
        // });
        
        // this.step();
    }

    step() {
        if(this.moveTween) {
            this.moveTween.stop();
        }

        this.walkIndex++;
        if(!this.walkPosArray) {
            this.dynamicClip.actName = "stand";
            this.dynamicClip.updatePlay();
            this.moveTween = cc.tween(this.node)
                .delay(3)
                .call(this.gotoRandomBuild, this)
                .start();
            return;
        }

        let pos = this.walkPosArray[this.walkIndex];

        if(this.walkIndex >= this.walkPosArray.length || GameContext.getInstance().canWalk(pos.x, pos.y) == false) {
            // 更新角色朝向
            pos = this.walkPosArray[this.walkPosArray.length - 1];
            this.dynamicClip.direction = GameUtils.getRoleDirection(this.getComponent(UnitInfo).logicTransform, pos);
            this.dynamicClip.actName = "attack1";
            this.dynamicClip.updatePlay();
            this.moveTween = cc.tween(this.node)
                .delay(3)
                .call(this.gotoRandomBuild, this)
                .start();
            return;
        }

        // 更新角色朝向
        this.dynamicClip.direction = GameUtils.getRoleDirection(this.getComponent(UnitInfo).logicTransform, pos);
        this.dynamicClip.actName = "run";
        this.dynamicClip.updatePlay();

        this.setPosition(pos.x, pos.y, true);
        
        pos = GameContext.getInstance().logicTileAlgorithm.calculateMapTilePos(pos.x, pos.y);
        let toPos = new cc.Vec3(pos.x, pos.y, 0.0);
        let length = this.node.position.sub(toPos).len();

        this.moveTween = cc.tween(this.node)
            .to(length / 70, {position: toPos})
            .call(this.step, this)
            .start();
    }

    gotoRandomBuild() {
        const builds = GameContext.getInstance().gameLayer.builds;
        const build = builds[GameUtils.randomRangeInt(0, builds.length - 1)];

        if(build) {
            this.goto(build.getComponent(UnitInfo));
        }
        else {
            cc.tween(this.node)
            .delay(1)
            .call(this.gotoRandomBuild, this)
            .start();
        }
    }
}

