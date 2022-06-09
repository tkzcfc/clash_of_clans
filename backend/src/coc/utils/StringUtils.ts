
export namespace StringUtils {

    export function encodeBlob(data : any) {
        return stringToBase64(JSON.stringify(data));
        
    }

    export function decodeBlob(data : string) {
        data = base64ToString(data);
		if(data === "" || data === undefined) {
			data = "{}";
		}
        return JSON.parse(data);
    }

    function stringToBase64(str: string){
        let base64Str = Buffer.from(str).toString('base64');
        return base64Str;
    }
    function base64ToString(base64Str: string){
        let str = Buffer.from(base64Str,'base64').toString();
        return str;
    }
    
    export function toBuffer(ab: ArrayBuffer) {
        return Buffer.from(ab);
        // var buf = new Buffer(ab.byteLength);
        // var view = new Uint8Array(ab);
        // for (var i = 0; i < buf.length; ++i) {
        //     buf[i] = view[i];
        // }
        // return buf;
    }
}

