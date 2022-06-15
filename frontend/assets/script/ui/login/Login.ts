import { core } from "../../core/InitCore";
import { UIDelegate } from "../../core/ui_manager/UIDelegate";
import { RpcErrCode } from "../../shared/RpcErr";
import { LoginMgr } from "../../manager/LoginMgr";
import { mgr } from "../../manager/mgr";
import { RpcMgr } from "../../manager/RpcMgr";
import { UIUtils } from "../UIUtils";

const {ccclass, property} = cc._decorator;

@ccclass()
export class Login extends UIDelegate {

    @property(cc.EditBox)
    editBox_Account: cc.EditBox;
    
    @property(cc.EditBox)
    editBox_Password: cc.EditBox;

    protected onLoad(): void {
        mgr.termination();
        mgr.initialize();

        mgr.getMgr(RpcMgr).connect();

        this.editBox_Account.string = core.storage.get("username", "qwq");
        this.editBox_Password.string = core.storage.get("password", "qwq");

        // this.node.opacity = 0;
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

        this.doLogin();
    }

    async doLogin() {
        let account = this.editBox_Account.string;
        let password = this.editBox_Password.string;

        let ret = await mgr.getMgr(RpcMgr).callApi("ptl/Login", {
            account: account,
            password: password,
        })

        if(ret.isSucc) {
            // 登录成功
            core.storage.set("username", this.editBox_Account.string);
            core.storage.set("password", this.editBox_Password.string);

            mgr.getMgr(LoginMgr).token = ret.res.token;
            mgr.getMgr(LoginMgr).pid = ret.res.players[0];
            mgr.getMgr(LoginMgr).loginGame();
            return;
        }

        let code = ret.err.code;
        if(typeof(code) != "number") {
            cc.error("doLogin unknown error");
            return;
        }

        if(code == RpcErrCode.NOT_ACCOUNT) {
            UIUtils.showMsgBoxTwo("账号不存在，是否注册？", ()=>{
                this.doRegister();
            });
        }
    }

    async doRegister() {
        let account = this.editBox_Account.string;
        let password = this.editBox_Password.string;
        
        let ret = await mgr.getMgr(RpcMgr).callApi("ptl/Register", {
            account: account,
            password: password,
            platform: cc.sys.platform,
            deviceid: "",
        })

        if(ret.isSucc) {
            UIUtils.showMsgBoxOne("注册成功", ()=>{
                this.doLogin();
            });
        }
    }
};
