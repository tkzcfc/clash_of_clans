/*
 * Created: 2022-03-15 15:08:08
 * Author : fc
 * Description: 
 */

const {ccclass, property, disallowMultiple} = cc._decorator;


@ccclass()
@disallowMultiple()
export default class TableViewDelegate extends cc.Component {

    @property({type: cc.Integer, tooltip: "item数量", range:[0, Number.MAX_SAFE_INTEGER, 1]})
    itemNumber: number = 0;
    
    @property({tooltip: "item大小"})
    itemSize: cc.Size = new cc.Size(100, 200);

    /**
     * item个数
     */
    numberOfItem(): number {
        return this.itemNumber;
    }

    /**
     * 获取item大小
     * @param index 
     */
    getItemSize(index: number) : cc.Size {
        return this.itemSize;
    }

    /**
     * 获取item类型
     * @param index 
     */
    getItemType(index: number): number {
        return 0;
    }
};

