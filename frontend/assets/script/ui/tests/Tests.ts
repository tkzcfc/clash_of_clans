import { UIDelegate } from "../../core/ui/UIDelegate";
import TableView from "../../core/extensions/tableview/TableView";
import TableViewDelegate from "../../core/extensions/tableview/TableViewDelegate";
import TableViewItem from "../../core/extensions/tableview/TableViewItem";

const {ccclass, property, menu} = cc._decorator;

@ccclass()
@menu("ui/Tests")
export class Tests extends UIDelegate {
    @property(TableView)
    tableView: TableView;

    protected start(): void {
        this.tableView.delegate.itemNumber = 100;
        this.tableView.setOnItemUpdateCallback((item: TableViewItem)=>{
            cc.find("Background/icon_name", item.node).getComponent(cc.Label).string = `test${item.itemIndex}`;            
        });
        this.tableView.reload();
    }
};
