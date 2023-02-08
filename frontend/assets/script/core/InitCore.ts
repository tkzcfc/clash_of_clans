/*
 * Created: 2022-03-12 10:40:04
 * Author : fc
 * Description: 
 */


import { storage as SqlStorage } from "./common/storage/SqlUtil";
import { EventEmitter } from "./common/event/EventEmitter"
import { UIManager } from "./ui/UIManager";
import { ViewManager } from "./view/ViewManager";

export class core {
    /** 本地存储 */
    public static storage = SqlStorage;
    
    /** 系统事件派发器 */
    public static sysEventEmitter: EventEmitter<string>;

    /** UI管理器 */
    public static ui : UIManager;

    /** View管理器 */
    public static viewManager: ViewManager;
    

    public static uiContextPrefab: cc.Prefab;
    public static uiPanelPrefab: cc.Prefab;

    public static gameRootNode: cc.Node;
    public static guiRootNode: cc.Node;
}

