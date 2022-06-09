import { core } from "../../../core/InitCore";
import TableView from "../../../core/ui/TableView";
import { UIDelegate } from "../../../core/ui_manager/UIDelegate";
import { Const } from "../../common/Const";
import { FightMgr } from "../../manager/FightMgr";
import { mgr } from "../../manager/mgr";
import { MessageID } from "../../msg/Message";
import { NetError } from "../../msg/NetError";
import { UIUtils } from "../UIUtils";




const {ccclass, property} = cc._decorator;

@ccclass()
export class PlayerList extends UIDelegate {

    @property(TableView)
    playerListTableView: TableView;

    _players: any = null;
    _openFinish: boolean = false;

    /** UI即将打开 */
    public onUIBeforeOpened() {
        // 请求可攻击的玩家列表数据
        core.client.sendJson(core.NET_KEY_GAME, MessageID.GET_PVP_LIST_REQ, null);
        
        core.netEventEmitter.on(MessageID.GET_PVP_LIST_ACK, (msg: any)=>{
            this._players = msg.players;
            this.tryShowPlayerList();
        }, this);

        core.netEventEmitter.on(MessageID.ATTACK_PLAYER_ACK, (msg: any)=>{
            if(msg.code == NetError.OK) {
                mgr.getMgr(FightMgr).setPvPPlayerInfo(msg);
                core.viewManager.runView(Const.Views.GameView);
            }
            else {
                UIUtils.showMsgBoxOne(`错误码:${msg.code}`);
            }
        }, this);
    }

    /** UI打开完毕 */
    public onUIAfterOpened() {
        this._openFinish = true;
        this.tryShowPlayerList();
    }
    
    /** UI关闭完成(即将销毁) */
    public onUIDismiss() {
        core.netEventEmitter.removeAllListenerByContext(this);
    }

    tryShowPlayerList() {
        if(!this._openFinish || !this._players) {
            return;
        }

        this.playerListTableView.getDelegate().itemNumber = this._players.length;
        this.playerListTableView.reload(this._players);
    }
}
