import { core } from "../../core/InitCore";
import { Const } from "../common/Const";
import { MessageBox } from "./common/MessageBox";

export namespace UIUtils{

    export function showMsgBoxOne(content: string, callbaack?: Function) {
        core.ui.current().pushUI(Const.UIs.MessageBox, null, (node: cc.Node)=>{
            node.getComponent(MessageBox).showOne(content, callbaack);
        }, 10);
    }
    
    export function showMsgBoxTwo(content: string, callbaack1?: Function, callbaack2?: Function) {
        core.ui.current().pushUI(Const.UIs.MessageBox, null, (node: cc.Node)=>{
            node.getComponent(MessageBox).showTwo(content, callbaack1, callbaack2);
        }, 10);
    }
}


