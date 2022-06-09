import { core } from "../../../core/InitCore";
import { UIDelegate } from "../../../core/ui_manager/UIDelegate";
import { Const } from "../../common/Const";
import { PlayerData } from "../../data/PlayerData";
import { MessageID } from "../../msg/Message";
import { NetError } from "../../msg/NetError";
import { UIUtils } from "../UIUtils";

const {ccclass, property} = cc._decorator;

@ccclass()
export class Login extends UIDelegate {

    @property(cc.EditBox)
    editBox_Account: cc.EditBox;
    
    @property(cc.EditBox)
    editBox_Password: cc.EditBox;

    protected onLoad(): void {
        core.client.connect(core.NET_KEY_GAME, {
            protocol : "ws",
            ip: "1.14.65.70", // localhost   1.14.65.70
            port: 8205,
        });
        this.initEvent();

        this.editBox_Account.string = core.storage.get("username", "qwq");
        this.editBox_Password.string = core.storage.get("password", "qwq");
    }

    protected onDestroy(): void {
        core.netEventEmitter.removeAllListenerByContext(this);
    }

    onClickLogin() {
        let account = this.editBox_Account.string;
        let password = this.editBox_Password.string;

        if(account == "") {
            UIUtils.showMsgBoxOne("请输入登录账号");
            return;
        }
        
        if(password == "") {
            UIUtils.showMsgBoxOne("请输入登录密码");
            return;
        }

        core.client.sendJson(core.NET_KEY_GAME, MessageID.LOGIN_GAME_REQ, {
            account: account,
            password: password
        });
    }

    initEvent() {        
        core.netEventEmitter.on(MessageID.LOGIN_GAME_ACK, (msg: any)=>{
            if(msg.code == NetError.Account_Not_Exist) {
                UIUtils.showMsgBoxTwo("账号不存在，是否注册？", ()=>{
                    core.client.sendJson(core.NET_KEY_GAME, MessageID.REGISTER_REQ, {
                        account: this.editBox_Account.string,
                        password: this.editBox_Password.string
                    });
                });
            }
            else if(msg.code == NetError.Password_Error) {
                UIUtils.showMsgBoxOne("密码错误");
            }
            else if(msg.code == NetError.OK){
                // 登录成功
                core.storage.set("username", this.editBox_Account.string);
                core.storage.set("password", this.editBox_Password.string);
            }
        }, this);

        core.netEventEmitter.on(MessageID.REGISTER_ACK, (msg: any)=> {
            if(msg.code == NetError.OK) {
                UIUtils.showMsgBoxOne("注册成功!");
            }
            else {
                UIUtils.showMsgBoxOne(`注册失败，错误码:${msg.code}`);
            }
        }, this);
    }
};
