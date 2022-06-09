/*
 * Created: 2022-03-29 10:40:16
 * Author : fc
 * Description: 斜45度地图中元素排序
 */

import { UnitInfo, UnitTransform } from "../unit/UnitInfo";

let remove = cc.js.array.remove;

export namespace UnitSort {

    /**
     * 对斜15度元素排序
     * @param itemSet 元素合集
     * @param zScale Zorder缩放系数
     * @returns orderedList 排序好的元素数组
     */
    export function doSort(itemSet: UnitInfo[], zScale: number){
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
    function xxFind(candidateList: UnitInfo[], itemSet: UnitInfo[]) {
        let maxZItem = getMaxZItem(candidateList);

        let exceptList = new Map<UnitInfo, boolean>();
        exceptList.set(maxZItem, true);
        do{
            let item = filter(maxZItem.logicTransform, exceptList, itemSet);
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
     function getMaxZItem(list: UnitInfo[]): UnitInfo {
        let minItem = list[0];
        let minY = minItem.logicTransform.getMinY();

        let curTransform: UnitTransform;
        for(let i = 1, j = list.length; i < j; ++i) {
            curTransform = list[i].logicTransform;
            if(curTransform.getMinY() < minY) {
                minItem = list[i];
                minY = curTransform.getMinY();
            }
            else if(curTransform.getMinY() == minY) {
                if(curTransform.getMinX() < minItem.logicTransform.getMinX()) {
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
     function filter(curItem: UnitTransform, exceptList: Map<UnitInfo, boolean>, itemSet: UnitInfo[]) {
        let list: UnitInfo[] = [];

        let v: UnitTransform;

        itemSet.forEach((unit: UnitInfo)=>{
            if(!exceptList.get(unit)) {
                v = unit.logicTransform;

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

