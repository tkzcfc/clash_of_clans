/*
 * Created: 2022-03-17 15:34:22
 * Author : fc
 * Description: 消息校验/分片收发管理
 */


// 消息头部校验标记
const MSG_HEAD_TAG_1 = 0xCC;
const MSG_HEAD_TAG_2 = 0xFC;
const MSG_HEAD_TAG_3 = 0xFC;
const MSG_HEAD_TAG_4 = 0xCC;

// 消息尾部校验标记
const MSG_TAIL_TAG_1 = 0xCF;
const MSG_TAIL_TAG_2 = 0xEF;
const MSG_TAIL_TAG_3 = 0xEF;
const MSG_TAIL_TAG_4 = 0xFE;

// 消息最大长度8mb
const PACK_MSG_SIZE_MAX = 1024 * 1024 * 8;
// 消息分片大小
const PACK_MSG_BLOCK_SIZE = 1400;


export class PackMsg {

    // 解码失败-数据错误
    static CODE_DATA_ERR: number = -1;
    // 解码失败-数据不足，等待后续数据继续解码
    static CODE_WAIT: number = 0;
    // 解码成功
    static CODE_OK: number = 1;
    
    private dataBuffer: DataView = new DataView(new ArrayBuffer(PACK_MSG_SIZE_MAX * 2));
    private dataSize: number = 0;


    // 接受消息回调
    private recvCallback: Function;
    // 发送消息回调
    private sendCallback: Function;


    constructor() {
        this.recvCallback = function(){ console.assert(false); };
        this.sendCallback = function(){ console.assert(false); };
    }

    /**
     * 
     * @param recvCallback 接收回调
     */
    public setRecvCallback(recvCallback: Function) {
        this.recvCallback = recvCallback;        
    }

    /**
     * 
     * @param sendCallback 发送回调
     */
    public setSendCallback(sendCallback: Function) {
        this.sendCallback = sendCallback;        
    }

    /**
     * 写入消息
     * @param msgid 消息id
     * @param msg 消息内容
     */
    public write(msgid: number, msg: string) {
        let data = this.encodeMsg(msgid, msg);
        let len = data.byteLength;


        if(len <= PACK_MSG_BLOCK_SIZE) {
            this.sendCallback(data);
        }
        else {
            let cur = 0;
            do {
                let size = Math.min(len - cur, PACK_MSG_BLOCK_SIZE);
                this.sendCallback(data.slice(cur, cur + size));
                cur += size;
            } while (cur < len);
        }
    }

    /**
     * 读取消息
     * @param buffer WebSocket接受到的数据
     * @returns 返回TRUE则表示一切正常返回false则表示数据校验失败，外部应该关闭套接字
     */
    public read(buffer: ArrayBuffer | Uint8Array, bufLen ?: number) {
        let binary: Uint8Array;
        if(buffer instanceof ArrayBuffer) {
            binary = new Uint8Array(buffer);
            if(bufLen === undefined) {
                bufLen = buffer.byteLength;
            }
        }
        else {
            binary = buffer;
            if(bufLen === undefined) {
                bufLen = buffer.length;
            }
        }

        for(let i = 0; i < bufLen; ++i) {
            this.dataBuffer.setUint8(this.dataSize++, binary[i]);
        }

        do {
            let code = this.decodeMsg();
            if(code == PackMsg.CODE_WAIT){
                break;
            }
            else if(code == PackMsg.CODE_DATA_ERR){
                return false;
            }
        } while (true);

        return true;
    }

    
    /**
     * 消息编码
     * @param msgid 消息id
     * @param msg 消息内容
     * @returns 
     */
     private encodeMsg(msgid: number, msg: string) {
        let msgBinary = strToUtf8Array(msg);
        let msgLen = msgBinary.byteLength;

        if(msgLen >= PACK_MSG_SIZE_MAX) {
            console.assert(false, "消息数据过长");
        }
        // console.log("msgLen: " + msgLen);

        // head tag + length + msgid + msg + tail tag
        let totalLen = 4 + 4 + 4 + msgLen + 4;
        let binary = new ArrayBuffer(totalLen);

        let dataView = new DataView(binary);
        // head tag
        dataView.setInt8(0, MSG_HEAD_TAG_1);
        dataView.setInt8(1, MSG_HEAD_TAG_2);
        dataView.setInt8(2, MSG_HEAD_TAG_3);
        dataView.setInt8(3, MSG_HEAD_TAG_4);

        // length
        dataView.setInt32(4, totalLen, true);
        
        // msgid
        dataView.setInt32(8, msgid, true);

        // msg
        for(let i = 0; i < msgLen; ++i) {
            dataView.setUint8(12 + i, msgBinary[i]);
        }

        // tail tag
        dataView.setUint8(totalLen - 4, MSG_TAIL_TAG_1)
        dataView.setUint8(totalLen - 3, MSG_TAIL_TAG_2)
        dataView.setUint8(totalLen - 2, MSG_TAIL_TAG_3)
        dataView.setUint8(totalLen - 1, MSG_TAIL_TAG_4)

        return binary;
    }


    /**
     * 消息解码
     */
    private decodeMsg() {
        if(this.dataSize < 16)
            return PackMsg.CODE_WAIT;

        let dataView = this.dataBuffer;
        
        let tag1 = dataView.getUint8(0);
        let tag2 = dataView.getUint8(1);
        let tag3 = dataView.getUint8(2);
        let tag4 = dataView.getUint8(3);

        if(tag1 === MSG_HEAD_TAG_1 && tag2 === MSG_HEAD_TAG_2 && tag3 === MSG_HEAD_TAG_3 && tag4 === MSG_HEAD_TAG_4)
        {
            let total = dataView.getInt32(4, true);
            let msgId = dataView.getInt32(8, true);
            let msgLen = total - 16;

            // 消息长度过长或过短
            if(msgLen < 0 || msgLen > PACK_MSG_SIZE_MAX)
                return PackMsg.CODE_DATA_ERR;

            if(total > this.dataSize)
                return PackMsg.CODE_WAIT;

            // 尾部数据校验
            tag1 = dataView.getUint8(total - 4);
            tag2 = dataView.getUint8(total - 3);
            tag3 = dataView.getUint8(total - 2);
            tag4 = dataView.getUint8(total - 1);
            if(tag1 === MSG_TAIL_TAG_1 && tag2 === MSG_TAIL_TAG_2 && tag3 === MSG_TAIL_TAG_3 && tag4 === MSG_TAIL_TAG_4) {
                let msg = "";
                if(msgLen > 0) {
                    let bb = new Uint8Array(new ArrayBuffer(msgLen));
                    for(let i = 0; i < msgLen; ++i) {
                        bb[i] = dataView.getUint8(12 + i);
                    }
                    msg = Utf8ArrayToStr(bb);
                }
    
                // 将数据前移total个字节
                let count = this.dataSize - total;
                for(let i = 0; i < count; ++i) {
                    dataView.setUint8(i, dataView.getUint8(total + i));
                }
                this.dataSize -= total;
    
                // 消息派发
                this.recvCallback(msgId, msg);
                // console.log("curSize:" + this.dataSize);
            }
            else {
                // 数据错误
                return PackMsg.CODE_DATA_ERR;
            }
        }
        else{
            // 数据错误
            return PackMsg.CODE_DATA_ERR;
        }
    }
}





/**
 * 字符串 to utf8 编码 bytes 支持中文 
 * 等效于 nodejs/fun.js 中的 Utf8ToBuffer
 * @param {String} string 
 * @param {*} options 
 * @return {Uint8Array}
 */
 function strToUtf8Array(str: string, options = { stream: false }): Uint8Array {
    if (options.stream) {
        throw new Error(`Failed to encode: the 'stream' option is unsupported.`);
    }

    let pos = 0;
    const len = str.length;
    const out = [];

    let at = 0;  // output position
    let tlen = Math.max(32, len + (len >> 1) + 7);  // 1.5x size
    let target = new Uint8Array((tlen >> 3) << 3);  // ... but at 8 byte offset

    while (pos < len) {
        let value = str.charCodeAt(pos++);
        if (value >= 0xd800 && value <= 0xdbff) {
            // high surrogate
            if (pos < len) {
                const extra = str.charCodeAt(pos);
                if ((extra & 0xfc00) === 0xdc00) {
                    ++pos;
                    value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
                }
            }
            if (value >= 0xd800 && value <= 0xdbff) {
                continue;  // drop lone surrogate
            }
        }
        // expand the buffer if we couldn't write 4 bytes
        if (at + 4 > target.length) {
            tlen += 8;  // minimum extra
            tlen *= (1.0 + (pos / str.length) * 2);  // take 2x the remaining
            tlen = (tlen >> 3) << 3;  // 8 byte offset

            const update = new Uint8Array(tlen);
            update.set(target);
            target = update;
        }

        if ((value & 0xffffff80) === 0) {  // 1-byte
            target[at++] = value;  // ASCII
            continue;
        } else if ((value & 0xfffff800) === 0) {  // 2-byte
            target[at++] = ((value >> 6) & 0x1f) | 0xc0;
        } else if ((value & 0xffff0000) === 0) {  // 3-byte
            target[at++] = ((value >> 12) & 0x0f) | 0xe0;
            target[at++] = ((value >> 6) & 0x3f) | 0x80;
        } else if ((value & 0xffe00000) === 0) {  // 4-byte
            target[at++] = ((value >> 18) & 0x07) | 0xf0;
            target[at++] = ((value >> 12) & 0x3f) | 0x80;
            target[at++] = ((value >> 6) & 0x3f) | 0x80;
        } else {
            // FIXME: do we care
            continue;
        }

        target[at++] = (value & 0x3f) | 0x80;
    }

    return target.slice(0, at);
}

/**
 * Uint8Array 转 String 支持中文
 * 等效于 nodejs/fun.js 中的 BufferToUtf8
 * @param {Uint8Array} array  不能是 arraybuffer 必须是Uint8Array
 * @return {String}
 */
function Utf8ArrayToStr(array: Uint8Array) {
    var out, i, len, c;
    var char2, char3;

    out = "";

    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}