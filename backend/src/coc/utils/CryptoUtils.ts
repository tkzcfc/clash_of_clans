import { randomUUID } from "crypto";
const { v4: uuidv4 } = require('uuid');

export namespace CryptoUtils {

    export function generateUUID() {
        // return randomUUID();
        return uuidv4();
    }

}

