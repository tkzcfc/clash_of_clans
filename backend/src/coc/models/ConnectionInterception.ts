import { RpcService } from "../service/tsrpc/RpcService";

// 单个IP最大连接数量,超过这个数量则将该IP加入黑名单
const MAX_CONNECT_NUM_SAME_IP = 100

// 黑名单
var blacklist = new Set<string>();

// 连接拦截
export function connectionInterception(service: RpcService) {
    service.rpc.flows.postConnectFlow.push(v=>{
        let curIp = v.ip;
        let count = 0;

        if(blacklist.has(curIp)) {
            v.logger.error("Blacklist request");
            v.close("Blacklist request");
            return undefined;
        }

        service.rpc.connections.forEach((conn)=>{
            if(curIp == conn.ip) {
                count++;
            }
        });

        if(count > MAX_CONNECT_NUM_SAME_IP) {
            service.rpc.connections.forEach((conn)=>{
                if(curIp == conn.ip) {
                    conn.close();
                }
            });

            blacklist.add(curIp);
            v.logger.error("Join the blacklist");
            v.close();
        }

        return v;
    });
}

