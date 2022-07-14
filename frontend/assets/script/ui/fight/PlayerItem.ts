import { core } from "../../core/InitCore";
import TableView from "../../core/ui/TableView";
import TableViewItem from "../../core/ui/TableViewItem";
import { PvpListItem } from "../../shared/protocols/ptl/PtlGetPvpList";
import { FightMgr } from "../../manager/FightMgr";
import { mgr } from "../../manager/mgr";
import { RpcMgr } from "../../manager/RpcMgr";
import GameView from "../../views/GameView";



const {ccclass, property} = cc._decorator;

@ccclass()
export class PlayerItem extends TableViewItem {

    @property(cc.Label)
    textName: cc.Label;

    @property(cc.Label)
    textLv: cc.Label;

    data: PvpListItem;

    /**
     * 需要刷新item时调用此函数
     */
     onUpdateItem(datas: PvpListItem[], tableView: TableView) {
        let data = datas[this.itemIndex];
        this.data = data;

        this.textName.string = data.name === "" ? data.pid : data.name;
        this.textLv.string = data.lv.toString();
     }

     onClickFight() {
        this.doFight();
     }

     async doFight() {
        let result = await mgr.getMgr(RpcMgr).callApi("ptl/AttackPlayer", {
            pid: this.data.pid
        })

        if(result.isSucc) {
            mgr.getMgr(FightMgr).setPvPInfo(result.res.pdata, result.res.map);
            core.viewManager.runEmptyView(GameView);
        }
     }
}
