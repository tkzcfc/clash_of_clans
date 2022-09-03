import TableView from "../../core/ui/TableView";
import TableViewItem from "../../core/ui/TableViewItem";



const {ccclass, property} = cc._decorator;

@ccclass()
export class DebugGameItem extends TableViewItem {

    @property(cc.Label)
    textName: cc.Label;

    @property(cc.Toggle)
    checkBox: cc.Toggle;

    /**
     * 需要刷新item时调用此函数
     */
     onUpdateItem(datas: any[], tableView: TableView) {
        let data = datas[this.itemIndex];

        this.textName.string = data.name;

        this.checkBox.isChecked = data.isSelect;
        this.checkBox.interactable = !data.isSelect;

        this.checkBox.node.targetOff(this);
        this.checkBox.node.on('toggle', (target: cc.Toggle)=>{
            data.callback(this.itemIndex, target.isChecked);
        }, this);
     }
}
