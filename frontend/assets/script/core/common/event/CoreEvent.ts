/*
 * Created: 2022-03-16 09:15:58
 * Author : fc
 * Description: 框架系统事件
 */


export class CoreEvent {
    static NET_ON_CONNECT_START = "connect_start";
    static NET_ON_OPEN = "onopen";
    static NET_ON_CLOSE = "onclose";
    static NET_ON_ERROR = "onerror";

    static UI_ON_WILL_OPEN = "UI_ON_WILL_OPEN";
    static UI_ON_OPEN_FINISH = "UI_ON_OPEN_FINISH";
    static UI_ON_WILL_CLOSE = "UI_ON_WILL_CLOSE";
    static UI_ON_CLOSE_FINISH = "UI_ON_CLOSE_FINISH";
    static UI_ON_VIEW_VISIBLE = "UI_ON_VIEW_VISIBLE";
}
