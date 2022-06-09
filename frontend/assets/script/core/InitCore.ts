/*
 * Created: 2022-03-12 10:40:04
 * Author : fc
 * Description: 
 */


import { storage } from "./common/storage/SqlUtil";
import { EventEmitter } from "./common/event/EventEmitter"
import { UIManager } from "./ui_manager/UIManager";
import { WSClient } from "./network/WSClient";
import { ViewManager } from "./view_manager/ViewManager";

export class core {
    /** 本地存储 */
    public static storage = storage;

    /** 网络事件派发器 */
    public static netEventEmitter: EventEmitter<number>;
    
    /** 系统事件派发器 */
    public static sysEventEmitter: EventEmitter<string>;

    /** 客户端网格管理 */
    public static client : WSClient;

    /** UI管理器 */
    public static ui : UIManager;

    /** View管理器 */
    public static viewManager: ViewManager;
    

    public static uiContextPrefab: cc.Prefab;
    public static uiPanelPrefab: cc.Prefab;

    public static gameRootNode: cc.Node;
    public static guiRootNode: cc.Node;



    public static NET_KEY_GAME = "game";
}