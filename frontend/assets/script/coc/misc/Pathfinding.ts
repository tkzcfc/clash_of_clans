/*
 * Created: 2022-07-05 14:44:45
 * Author : fc
 * Description: 寻路管理
 */

import { AStar, CheckFuncType } from "../algorithm/AStar";
import { GameContext } from "./GameContext";

let astar: AStar = new AStar();
let tasks = [];

export namespace Pathfinding {
    export async function runAsync(from: cc.Vec2, to: cc.Vec2, check_func: CheckFuncType, target: any): Promise<cc.Vec2[]> {
        return new Promise(function(resolve, reject){
            tasks.push({
                from : from,
                to : to,
                check_func : check_func,
                cb : resolve,
                target: target,
            });
        });
    }

    export function cancel(target: any) {
        for (let index = 0; index < tasks.length; index++) {
            let task = tasks[index];
            if(task.target === target) {
                task.cb();
                task.cb = undefined;
                break;
            }
        }
    }

    export function update() {
        if(tasks.length <= 0){
            return;
        }

        const logicTileAlgorithm = GameContext.getInstance().logicTileAlgorithm;
        const task = tasks[0];
        tasks.splice(0, 1);

        if(!task.cb) {
            this.update();
            return;
        }

        let walkPosArray = astar.run(logicTileAlgorithm.X_COUNT, logicTileAlgorithm.Y_COUNT, task.from, task.to, task.check_func);
        task.cb(walkPosArray);
    }

    export function reset() {
        tasks = [];
    }
}

