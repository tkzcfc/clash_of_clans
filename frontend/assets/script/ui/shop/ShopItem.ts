

import { GameCfgKey } from "../../common/config/GameCfgKey";
import TableView from "../../core/ui/TableView";
import TableViewItem from "../../core/ui/TableViewItem";
import { GameCfgHelper } from "../../common/config/GameCfgHelper";
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
        let data = datas[this.itemIndex];
        let cfg = mgr.getMgr(GameCfgMgr).getData(GameCfgKey.Items, data);

        this.iconName.string = cfg.Name;

        let imgURL = GameCfgHelper.getItemImage(cfg);
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
