/*
 * Created: 2022-03-15 15:41:37
 * Author : fc
 * Description: 
 */

import TableView from "./TableView";

const {ccclass, property, disallowMultiple} = cc._decorator;


@ccclass()
@disallowMultiple()
export default class TableViewItem extends cc.Component {

    @property({visible: false})
    itemIndex: number = -1;

    /**
     * item被首次创建时调用此函数
     */
    onInitItem() {
    }

    /**
     * 需要刷新item时调用此函数
     */
    onUpdateItem(datas: any, tableView: TableView) {  
    }

    /**
     * 被回收时调用此函数
     */
    onRecycle() {
    }
};

