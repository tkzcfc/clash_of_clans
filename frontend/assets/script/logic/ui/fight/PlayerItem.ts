import { core } from "../../../core/InitCore";
import TableView from "../../../core/ui/TableView";
import TableViewItem from "../../../core/ui/TableViewItem";
import { MessageID } from "../../msg/Message";



const {ccclass, property} = cc._decorator;

@ccclass()
export class PlayerItem extends TableViewItem {

    @property(cc.Label)
    textName: cc.Label;

    @property(cc.Label)
    textLv: cc.Label;

    _data: any;

    /**
     * 需要刷新item时调用此函数
     */
     onUpdateItem(datas: any, tableView: TableView) {
        let data = datas[this.itemIndex];
        this._data = data;

        this.textName.string = data.name === "" ? data.pid : data.name;
        this.textLv.string = data.lv;
     }

     onClickFight() {
      //   console.log(this._data.pid)
        core.client.sendJson(core.NET_KEY_GAME, MessageID.ATTACK_PLAYER_REQ, {
            pid: this._data.pid
        });
     }
}
