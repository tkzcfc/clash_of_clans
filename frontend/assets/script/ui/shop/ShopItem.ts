

import TableView from "../../core/extensions/tableview/TableView";
import TableViewItem from "../../core/extensions/tableview/TableViewItem";
import { GameCfgMgr } from "../../manager/GameCfgMgr";
import { mgr } from "../../manager/mgr";

const {ccclass, property} = cc._decorator;

@ccclass()
export class ShopItem extends TableViewItem {

    @property(cc.Sprite)
    iconSpr: cc.Sprite;

    @property(cc.Label)
    iconName: cc.Label;

    imgURL: string = "";
    
    /**
     * 需要刷新item时调用此函数
     */
     onUpdateItem(datas: any, tableView: TableView) {  
        const data = datas[this.itemIndex];
        const cfg = mgr.getMgr(GameCfgMgr).getData("Items", data);

        this.iconName.string = cfg.Name;

        let imgURL = cfg.Resource;
        if(this.imgURL !== imgURL) {
            this.imgURL = imgURL;
            this.iconSpr.node.active = false;
            cc.resources.load(imgURL, cc.SpriteFrame, (error, spr: cc.SpriteFrame)=>{
                this.iconSpr.spriteFrame = spr;
                this.iconSpr.node.active = true;
            });
        }
    }
}
