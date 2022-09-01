/*
 * Created: 2022-03-29 10:40:16
 * Author : fc
 * Description: 斜45度地图中元素排序
 */

import { GameUnit } from "../unit/GameUnit";

const remove = cc.js.array.remove;

export namespace UnitSort {

    /**
     * 对斜15度元素排序
     * @param itemSet 元素合集
     * @param zScale Zorder缩放系数
     * @returns orderedList 排序好的元素数组
     */
    export function doSort(itemSet: GameUnit[], zScale: number){
        let totalCount = itemSet.length;
        let orderedList = [];

        do{
            if(itemSet.length <= 0) {
                break;
            }

            // 查找Z轴最高的元素
            let maxZItem = xxFind(itemSet, itemSet);

            // 删除该元素
            remove(itemSet, maxZItem);
            orderedList.push(maxZItem);

            maxZItem.node.zIndex = totalCount * zScale;

            totalCount--;
        }while(true);

        return orderedList;
    }

    /**
     * 在元素列表candidateList中查找Z轴最高的元素
     * @param candidateList 候选列表
     * @param itemSet 
     */
    function xxFind(candidateList: GameUnit[], itemSet: GameUnit[]) {
        let maxZItem = getMaxZItem(candidateList);

        let exceptList = new Map<GameUnit, boolean>();
        exceptList.set(maxZItem, true);
        do{
            let item = filter(maxZItem, exceptList, itemSet);
            if(!item) {
                break;
            }
            maxZItem = item;
        } while(true);

        return maxZItem;
    }

    /**
     * 在元素列表中查找Y值可能最小的元素(Y值越小即Z值越大)
     * @param list 
     */
     function getMaxZItem(list: GameUnit[]): GameUnit {
        let minItem = list[0];
        let minY = minItem.getMinY();

        let curUnit: GameUnit;
        for(let i = 1, j = list.length; i < j; ++i) {
            curUnit = list[i];
            if(curUnit.getMinY() < minY) {
                minItem = list[i];
                minY = curUnit.getMinY();
            }
            else if(curUnit.getMinY() == minY) {
                if(curUnit.getMinX() < minItem.getMinX()) {
                    minItem = list[i];
                }
            }
        }
        
        return minItem;
    }


    /**
     * 查询与当前元素 curItem 在Y轴相交的元素列表,并将查找到的元素列表回溯求解
     * @param curItem 当前元素
     * @param exceptList 排除元素列表
     * @param itemSet 所有元素合集
     */
     function filter(curItem: GameUnit, exceptList: Map<GameUnit, boolean>, itemSet: GameUnit[]) {
        let list: GameUnit[] = [];

        let v: GameUnit;

        itemSet.forEach((unit: GameUnit)=>{
            if(!exceptList.get(unit)) {
                v = unit;

                if(v.getMaxY() < curItem.getMinY() || curItem.getMaxY() < v.getMinY()) {
                    // Y轴不相交 pass
                }
                else {
                    // X比curItemX小,Z值才有可能大于curItem
                    if(v.getMinX() < curItem.getMinX()) {
                        list.push(unit);
                        exceptList.set(unit, true);
                    }
                }
            }
        });

        if(list.length <= 0)
            return;
        
        if(list.length == 1)
            return list[0];

        return xxFind(list, itemSet);
    }
}

