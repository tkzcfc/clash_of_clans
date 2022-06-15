import TableView from "../../core/ui/TableView";
import { UIDelegate } from "../../core/ui_manager/UIDelegate";
import { mgr } from "../../manager/mgr";
import { RpcMgr } from "../../manager/RpcMgr";
import { PvpListItem } from "../../shared/protocols/ptl/PtlGetPvpList";

const {ccclass, property} = cc._decorator;

const GetPvpList_abortKey = "GetPvpList##PlayerList";

@ccclass()
export class PlayerList extends UIDelegate {

    @property(TableView)
    playerListTableView: TableView;

    private players: PvpListItem[] | undefined = undefined;
    private openFinish: boolean = false;


    /** UI即将打开 */
    public onUIBeforeOpened() {
        this.doRequest();
    }

    /** UI打开完毕 */
    public onUIAfterOpened() {
        this.openFinish = true;
        this.tryShowPlayerList();
    }
    
    /** UI关闭完成(即将销毁) */
    public onUIDismiss() {
        mgr.getMgr(RpcMgr).client.abortByKey(GetPvpList_abortKey);
    }

    async doRequest() {
        let result = await mgr.getMgr(RpcMgr).callApi("ptl/GetPvpList", {
            pageIndex : 0,
            pageCount : 100
        }, {
            abortKey: GetPvpList_abortKey,
        })

        if(result.isSucc) {
            this.players = result.res.items;
        }
    }

    tryShowPlayerList() {
        if(!this.openFinish || !this.players) {
            return;
        }

        this.playerListTableView.getDelegate().itemNumber = this.players.length;
        this.playerListTableView.reload(this.players);
    }
}
