import { core } from "../../core/InitCore";
import { MessageID } from "../msg/Message";
import { MapData } from "./MapData";


var instance: PlayerData = null;

export class PlayerData {
    static newInstance(msg: any) {
        console.assert(!instance);
        instance = new PlayerData(msg);
    }

    static getInstance() {
        return instance;
    }

    static destroy() {
        if(instance) {
            instance.onDestroy();
            instance = null;
        }
        return instance;
    }

    public token: string = "";

    // 玩家地图数据
    public mapData: MapData;
    // 玩家id
    public playerId: string;
    // 玩家名称
    public playerName: string;
    // 玩家等级
    public level: number;
    // 玩家经验
    public exp: number;
    // 玩家金币
    public gold: number;
    // 玩家钻石
    public diamond: number;

    // 不重要数据
    public unimportantData: any;

    // 数据缓存
    private cacheUnimportantData: string;

    constructor(msg: any) {
        this.playerId = msg.pid;

        let data = msg.data;

        this.playerId = data.playerId;
        this.playerName = data.playerName;
        this.level = data.level;
        this.exp = data.exp;
        this.gold = data.gold;
        this.diamond = data.diamond;

        let unimportant = data.unimportant;
        if(unimportant == "") {
            this.unimportantData = {
                map: {
                    items: [
                        {
                            id: 10015,
                            lv: 1,
                            x: 18,
                            y: 18,
                        },
                        // {
                        //     id: 10015,
                        //     lv: 1,
                        //     x: 11,
                        //     y: 12,
                        // },
                    ]
                }
            }
            
            // this.sendMdfUnimportantData();
        }
        else {
            this.unimportantData  = JSON.parse(unimportant);
        }

        this.mapData = new MapData(this.unimportantData.map);

        this.initNetEvent();
    }

    sendMdfUnimportantData() {
        let data = JSON.stringify(this.unimportantData);
        if(data == this.cacheUnimportantData) {
            return;
        }
        this.cacheUnimportantData = data;

        core.client.sendJson(core.NET_KEY_GAME, MessageID.MDF_UNIMPORTANT_REQ, {
            data: data,
        });        
    }

    initNetEvent() {
        
    }

    tokenReconnection() {
        if(this.token && this.token !== "") {
            core.client.sendJson(core.NET_KEY_GAME, MessageID.LOGIN_GAME_REQ, {
                token: this.token,
            });
        }
    }
    
    onDestroy() {
        core.netEventEmitter.removeAllListenerByContext(this);

        this.mapData.onDestroy();
    }
}

