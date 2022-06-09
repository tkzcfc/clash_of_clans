import { ApiCall } from "tsrpc";
import { CryptoUtils } from "../../coc/utils/CryptoUtils";
import { OfflineCode } from "../../shared/protocols/msg/MsgSelfOffline";
import { ReqLogin, ResLogin } from "../../shared/protocols/ptl/PtlLogin";
import { RpcErrCode } from "../../shared/RpcErr";

export async function ApiLogin(call: ApiCall<ReqLogin, ResLogin>) {
    if(!GRpcService.accountMng) {
        return;
    }

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
        player.logout(OfflineCode.CHANGE_TOKEN);
        player.resetToken(token);
        ids.push(player.dbInfo.pid);
    });
    
    call.succ({
        token: token,
        players: ids,
    });
}