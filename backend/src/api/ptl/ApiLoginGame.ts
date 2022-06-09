import { ApiCall } from "tsrpc";
import { CryptoUtils } from "../../coc/utils/CryptoUtils";
import { OfflineCode } from "../../shared/protocols/msg/MsgSelfOffline";
import { ReqLoginGame, ResLoginGame } from "../../shared/protocols/ptl/PtlLoginGame";
import { RpcErrCode } from "../../shared/RpcErr";

export async function ApiLoginGame(call: ApiCall<ReqLoginGame, ResLoginGame>) {
    if(!GRpcService.playerMng) {
        return;
    }

    let player = GRpcService.playerMng.get(call.req.pid);
    if(!player) {
        call.error(STR("玩家不存在"), {
            code: RpcErrCode.NOT_PLAYER
        })
        return;
    }

    if(call.req.token != player.token) {
        call.error(STR("token错误"), {
            code: RpcErrCode.BAD_TOKEN
        })
        return;        
    }


    // 首次登录，客户端没有voucher
    if(call.req.voucher == "") {
        if(player.conn && player.conn.ip != call.conn.ip) {
            call.error(STR("玩家已在游戏中"), {
                code: RpcErrCode.Player_In_The_Game
            })
            return;
        }

        player.logout(OfflineCode.ALTERNATE_LOGIN);
        player.conn = call.conn;
        player.voucher = CryptoUtils.generateUUID();
    
        call.succ({
            pdata: player.dbInfo,
            voucher: player.voucher,
        });
    
        player.conn.sendMsg("msg/LoginPushB", {});

        player.conn.sendMsg("msg/LoginPushE", {});
    }
    else {
        // 断线重连
        if(player.isOnline()) {
            call.error(STR("玩家已在游戏中"), {
                code: RpcErrCode.Player_In_The_Game
            })
            return;
        }

        if(player.voucher != call.req.voucher) {
            call.error(STR("凭证过期"), {
                code: RpcErrCode.BAD_VOUCHER
            })
            return;
        }
        
        player.logout(OfflineCode.ALTERNATE_LOGIN);
        player.conn = call.conn;
        player.voucher = CryptoUtils.generateUUID();
    
        call.succ({
            pdata: player.dbInfo,
            voucher: player.voucher,
        });
    
        player.conn.sendMsg("msg/ReconBegin", {});

        player.conn.sendMsg("msg/ReconEnd", {});
    }
}