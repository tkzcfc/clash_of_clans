import { ApiCall } from "tsrpc";
import { ReqSaveMapUnits, ResSaveMapUnits } from "../../shared/protocols/ptl/PtlSaveMapUnits";

export async function ApiSaveMapUnits(call: ApiCall<ReqSaveMapUnits, ResSaveMapUnits>) {
    // TODO
    call.error('API Not Implemented');
}