/*
 * Created: 2022-03-18 16:27:31
 * Author : fc
 * Description: 
 */


import { core } from "../../../core/InitCore";
import { UIDelegate } from "../../../core/ui_manager/UIDelegate";

const {ccclass, property} = cc._decorator;

@ccclass()
export class NetLoading extends UIDelegate {
    
    protected update(dt: number): void {
        if(core.client.isConnect(core.NET_KEY_GAME))
            this.closeSelf();
    }

    
    /** 是否可以关闭UI */
    public canCloseUI(): boolean {
        return core.client.isConnect(core.NET_KEY_GAME);
    }
};
