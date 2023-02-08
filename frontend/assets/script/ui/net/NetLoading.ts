/*
 * Created: 2022-03-18 16:27:31
 * Author : fc
 * Description: 
 */


import { UIDelegate } from "../../core/ui/UIDelegate";
import { mgr } from "../../manager/mgr";
import { RpcMgr } from "../../manager/RpcMgr";

const {ccclass, property} = cc._decorator;

@ccclass()
export class NetLoading extends UIDelegate {

    protected update(dt: number): void {
        if(mgr.getMgr(RpcMgr).isConnect)
            this.closeSelf();
    }

    /** 是否可以关闭UI */
    public canCloseUI(): boolean {
        return mgr.getMgr(RpcMgr).isConnect;
    }

};
