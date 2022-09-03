import { UIDelegate } from "../../core/ui_manager/UIDelegate";
import TableView from "../../core/ui/TableView";
import TableViewDelegate from "../../core/ui/TableViewDelegate";
import { ShopItem } from "./ShopItem";
import { BuildComeFrom, ItemType } from "../../coc/const/enums";
import { UIUtils } from "../UIUtils";
import { mgr } from "../../manager/mgr";
import { GameCfgMgr } from "../../manager/GameCfgMgr";
import { GameContext } from "../../coc/misc/GameContext";
import { GameEvent } from "../../coc/misc/GameEvent";

const {ccclass, property} = cc._decorator;

@ccclass()
export class Shop extends UIDelegate {
    @property(TableView)
    tableView: TableView;
    @property(TableViewDelegate)
    tableViewDelegate: TableViewDelegate;

    showType: string = "";

    protected onLoad(): void {
        this.tableView.setOnItemCreateCallback((item: ShopItem)=>{
            item.node.on("click", ()=>{
                let itemId = this.getCurShowItems()[item.itemIndex];
                let cfg = mgr.getMgr(GameCfgMgr).getData("Items", itemId);

                if(cfg.Type === ItemType.buildings) {
                    let unitCfg = mgr.getMgr(GameCfgMgr).getData("Unit", cfg.OutputId[0]);
                    let placePos = GameContext.getInstance().getPlacePos(unitCfg.XCount, unitCfg.YCount);

                    if(placePos.x < 0) {
                        UIUtils.showMsgBoxOne("放不下啦!!!");
                        return;
                    }

                    let buildData = {
                        id: cfg.Id,
                        lv: 1,
                        x: placePos.x,
                        y: placePos.y,
                    }
                    GameContext.getInstance().eventEmitter.emit(GameEvent.DO_NEW_BUILD, buildData, BuildComeFrom.SHOP);
                    this._uiCtx.destroyUI(this.node);   
                }
            }, this);
        });
    }

    /** UI即将打开 */
    public onUIBeforeOpened() {
        cc.log("开始打开动画...");
    }

    /** UI打开完毕 */
    public onUIAfterOpened() {
        cc.log("打开完毕...");
        this.showItems("1");
    }

    /** UI即将关闭 */
    public onUIWillClose(): boolean {
        cc.log("即将关闭...");
        return true;
    }

    /** UI关闭完成(即将销毁) */
    public onUIDismiss() {
        cc.log("关闭完成...");
    }

    public onClickItemType(event, customEventData:string) {
        this.showItems(customEventData);
    }

    public showItems(type: string) {
        if(this.showType === type) {
            return;
        }
        this.showType = type;

        let items = this.getCurShowItems();
        this.tableViewDelegate.itemNumber = items.length;
        this.tableView.reload(items);
    }

    public getCurShowItems() {
        return mgr.getMgr(GameCfgMgr).getItem("Shop", this.showType, "Items");
    }
};
