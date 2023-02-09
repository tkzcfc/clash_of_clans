import { UIDelegate } from "../../core/ui/UIDelegate";
import TableView from "../../core/extensions/tableview/TableView";
import TableViewItem from "../../core/extensions/tableview/TableViewItem";
import { Const } from "../../common/Const";
import { core } from "../../core/InitCore";

const {ccclass, property, menu} = cc._decorator;

@ccclass()
@menu("ui/test/Tests")
export class Tests extends UIDelegate {
    @property(TableView)
    tableView: TableView;

    protected start(): void {
        this.tableView.delegate.itemNumber = 1;
        this.tableView.setOnItemUpdateCallback((item: TableViewItem)=>{
            cc.find("Background/icon_name", item.node).getComponent(cc.Label).string = `test${item.itemIndex + 1}`;   
            item.getComponent(cc.Button).node.on("click", ()=>{
                this.onClickItem(item);
            });         
        });
        this.tableView.reload();
    }

    onClickItem(item: TableViewItem) {
        switch (item.itemIndex) {
            case 0:                
                core.ui.current().pushUI(Const.UIs.Test_01);
                break;
        
            default:
                break;
        }
    }
};
