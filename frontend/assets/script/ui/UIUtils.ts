import { core } from "../core/InitCore";
import { Const } from "../common/Const";
import { MessageBox } from "./common/MessageBox";

export namespace UIUtils{

    export async function showMsgBoxOne(content: string, callback?: Function) {
        let node = await core.ui.current().pushUI(Const.UIs.MessageBox);
        node.getComponent(MessageBox).showOne(content, callback);
        return node;
    }
    
    export async function showMsgBoxTwo(content: string, callback1?: Function, callback2?: Function) {
        let node = await core.ui.current().pushUI(Const.UIs.MessageBox);
        node.getComponent(MessageBox).showTwo(content, callback1, callback2);
        return node;
    }
}


