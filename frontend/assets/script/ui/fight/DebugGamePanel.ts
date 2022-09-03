import { GameContext } from "../../coc/misc/GameContext";
import TableView from "../../core/ui/TableView";
import { UIDelegate } from "../../core/ui_manager/UIDelegate";

const {ccclass, property} = cc._decorator;


interface ItemData {
    name: string,
    callback: Function,
    isSelect: boolean
}

@ccclass()
export class DebugGamePanel extends UIDelegate {

    @property(TableView)
    playerListTableView: TableView;

    private datas: ItemData[] = [];
    private curSelectIndex: number = -1;

    /** UI打开完毕 */
    public onUIAfterOpened() {
        let gameLayer = GameContext.getInstance().gameLayer;
        this.curSelectIndex = gameLayer.debugDrawMode;


        const callbackFunc = (index: number)=>{
            this.onClickItem(index);
        }


        this.datas.push({
            name: "关闭调试",
            callback: callbackFunc,
            isSelect: false,
        })
        
        this.datas.push({
            name: "显示建筑实际区域",
            callback: callbackFunc,
            isSelect: false,
        })
        
        this.datas.push({
            name: "显示建筑排序实际区域",
            callback: callbackFunc,
            isSelect: false,
        })
        this.updateList();
    }

    onClickItem(index: number) {
        this.curSelectIndex = index;
        this.updateList();        
    }

    updateList() {

        for(let i = 0; i < this.datas.length; ++i) {
            this.datas[i].isSelect = this.curSelectIndex == i;
        }

        this.playerListTableView.getDelegate().itemNumber = this.datas.length;
        this.playerListTableView.reload(this.datas, true);
    }

    onClickOK() {
        this.closeSelf();
        
        let gameLayer = GameContext.getInstance().gameLayer;
        gameLayer.debugDrawMode = this.curSelectIndex;

    }
}
