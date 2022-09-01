import { ApiCall } from "tsrpc";
import { RandomUtils } from "../../coc/utils/RandomUtils";
import { ReqTest, ResTest } from "../../shared/protocols/ptl/PtlTest";

export default async function (call: ApiCall<ReqTest, ResTest>) {
    // TODO
    // call.error('API Not Implemented');

    call.succ({
        result : RandomUtils.nickname()
    });
}