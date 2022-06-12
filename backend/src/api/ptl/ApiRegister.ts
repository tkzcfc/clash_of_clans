import { ApiCall } from "tsrpc";
import { DBAccountInfo } from "../../shared/db_structure/Account";
import { ReqRegister, ResRegister } from "../../shared/protocols/ptl/PtlRegister";
import { RpcErrCode } from "../../shared/RpcErr";

export async function ApiRegister(call: ApiCall<ReqRegister, ResRegister>) {
    if(call.req.password == "") {
        call.error(STR("密码不合法"), {
            code: RpcErrCode.Illegal_Password
        });
        return;
    }

    if(GRpcService.accountMng.contain(call.req.account)) {
        call.error(STR("账号已存在"), {
            code: RpcErrCode.ACCOUNT_EXISTS            
        });
        return;
    }

    let info: DBAccountInfo = {
        account: call.req.account,
        password: call.req.password,
        platform: call.req.platform,
        deviceid: call.req.deviceid,
        players: [],
        registerDate: new Date(),
        registerIp: call.conn.ip
    };

    let player = GRpcService.playerMng.newPlayer();
    info.players.push(player.dbData.pid);

    GRpcService.accountMng.newAccount(info);
}