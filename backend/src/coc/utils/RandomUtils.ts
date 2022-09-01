
// import { randomUUID } from "crypto";
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
const path = require('path')
import { RandomNameRoot } from "../const/RandomName";

export namespace RandomUtils {
    export function uuid() {
        // return randomUUID();
        return uuidv4();
    }

    
    // let randomNameCfg: any = undefined;
    // function lazyInitRandomNameFile() {
    //     if(randomNameCfg != undefined) {
    //         return;
    //     }
    //     const configFile = path.resolve(__dirname, '../../config/randomName.json')
    //     const data = fs.readFileSync(configFile, 'utf8');
    //     // parse JSON string to JSON object
    //     randomNameCfg = JSON.parse(data);
    // }

    export function nickname(isMan: boolean | undefined = undefined) {
        if(isMan == undefined) {
            isMan = int(0, 1) == 0 ? true : false;
        }

        const root = RandomNameRoot;
        let base = isMan ? root['man'] : root['women'];

        let special = root['special'].split(",");
        let single = base["single"].split(",");
        let first = base["first"].split(",");
        let second = base["second"].split(",");

        let a = single[int(0, single.length - 1)];
        let b = special[int(0, special.length - 1)];
        let c = first[int(0, first.length - 1)];
        let d = special[int(0, special.length - 1)];
        let e = second[int(0, second.length - 1)];

        return a + b + c + d + e;
    }

    export function int(min: number, max: number) {
        let range = max - min; 
        var rand = Math.random();
        return(min + Math.round(rand * range));
    }
}
