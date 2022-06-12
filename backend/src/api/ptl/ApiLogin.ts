import { ApiCall } from "tsrpc";
import { CryptoUtils } from "../../coc/utils/CryptoUtils";
import { ReqLogin, ResLogin } from "../../shared/protocols/ptl/PtlLogin";
import { RpcErrCode } from "../../shared/RpcErr";

export async function ApiLogin(call: ApiCall<ReqLogin, ResLogin>) {
    let code = GRpcService.accountMng.login(call.req.account, call.req.password);
    if(code != RpcErrCode.OK) {
        call.error(STR("账号不存在或密码错误"), {
            code: code
        });
        return;
    }

    let players = GRpcService.accountMng.getPlayers(call.req.account);
    let ids: string[] = [];
    let token: string = CryptoUtils.generateUUID();

    players.forEach((player)=>{
        player.logout(RpcErrCode.Offline_CHANGE_TOKEN);
        player.resetToken(token);
        ids.push(player.dbData.pid);
    });
    
    call.succ({
        token: token,
        players: ids,
    });
}