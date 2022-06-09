/*
* @Author: fangcheng
* @Date:   2020-04-22 14:43:58
* 事件派发
*/

/**
 * 事件监听者
 */
export class EventListener {
    /** 回调函数 */
    public handler: Function;
    /** 上下文 */
    public context: any;
    /** 订阅次数 */
    public count: number;
    /** 唯一id */
    public uniqueId: number;

    constructor(handler: Function, context: any, count: number, uniqueId: number) {
        this.handler = handler;
        this.context = context;
        this.count = count;
        this.uniqueId = uniqueId;
    }
}


/**
 * 事件派发器
 */
export class EventEmitter<T> {
        // 最大优先级
        private PRIORITY_LEVEL_MAX : number = 3;
        // 默认优先级 (越小越先派发)
        private PRIORITY_LEVEL_DEFAULT : number = 1;
        // 事件监听map
        private event_listenerMap: Map<T, EventListener[][]>;
        // 唯一标识种子
        private uniqueSeed: number = 0;
    
        constructor() {
            this.event_listenerMap = new Map<T, EventListener[][]>();
        };
    
        /******************************************************* public *******************************************************/
    
        /**
       * 订阅事件
       * @param event 事件key
       * @param handler 监听者
       * @param context handler中的this对象
       * @param priority 派发优先级 默认1 (越小越先派发)
        */
        on(event: T, handler: Function, context: any, priority: number = this.PRIORITY_LEVEL_DEFAULT) {
            return this.addListener(event, handler, context, -1, priority);
        };
    
        /**
       * 订阅一次事件
       * @param event 事件key
       * @param handler 监听者
       * @param context handler中的this对象
       * @param priority 派发优先级 默认1 (越小越先派发)
        */
        once(event: T, handler: Function, context: any, priority: number = this.PRIORITY_LEVEL_DEFAULT) {
            return this.addListener(event, handler, context, 1, priority);
        };
    
        /**
       * 订阅事件
       * @param event 事件key
       * @param handler 监听者
       * @param context handler中的this对象
       * @param count 订阅次数
       * @param priority 派发优先级(越小越先派发)
        */
        addListener(event: T, handler: Function, context: any, count: number, priority: number = this.PRIORITY_LEVEL_DEFAULT) {    
            if (priority < 0 || priority >= this.PRIORITY_LEVEL_MAX) {
                throw new Error("Illegal 'priority'!");
            }
    
            if (count === undefined || count === null) {
                throw new Error("Illegal 'count'!");
            }
    
            // 检测重复订阅情况
            if (this.listenerContain(event, handler, context)) {
                // 发生重复订阅情况
                throw new Error("Repeat subscription!");
            }
    
            let listenerTabArr = this.event_listenerMap.get(event);
    
            if (!listenerTabArr) {
                listenerTabArr = [];
                for (let i = 0; i < this.PRIORITY_LEVEL_MAX; ++i) {
                    listenerTabArr.push([]);
                }
                this.event_listenerMap.set(event, listenerTabArr);
            }
    
            let uniqueId = this.uniqueSeed++;
    
            let listenerTab = listenerTabArr[priority];
            listenerTab.push(new EventListener(handler, context, count, uniqueId));

            return uniqueId;
        };
    
        /**
        * 取消订阅事件
        * @param uniqueId 订阅事件时返回的Id 
        */
        off(uniqueId: number) {
            this.event_listenerMap.forEach((listenerTabArr, event)=>{
                let exitLoop = false;
    
                for (let i = 0; i < listenerTabArr.length; ++i) {
                    let listenerTab = listenerTabArr[i];
                    for (let j = 0; j < listenerTab.length; ++j) {
                        if (listenerTab[j].uniqueId == uniqueId) {
                            listenerTab[j].count = 0;
                            exitLoop = true;
                            break;
                        }
                    }
                    if (exitLoop) break;
                }
            });
        };
    
        /**
       * 取消订阅事件
       * @param event 事件key
       * @param handler 监听者
       * @param context handler中的this对象
        */
        removeListener(event: T, handler: Function, context: any) {
            let listenerTabArr = this.event_listenerMap.get(event);
    
            if (!listenerTabArr) {
                return;
            }
    
            for (let i = 0; i < listenerTabArr.length; ++i) {
                let listenerTab = listenerTabArr[i];
                for (let j = 0; j < listenerTab.length; ++j) {
                    if (listenerTab[j].handler == handler && listenerTab[j].context == context) {
                        listenerTab[j].count = 0;
                    }
                }
            }
        };
    
        /**
       * 通过 context 取消订阅所有相关的事件
       * @param context
        */
        removeAllListenerByContext(context: any) {
            this.event_listenerMap.forEach((listenerTabArr, event)=>{
                for (let i = 0; i < listenerTabArr.length; ++i) {
                    let listenerTab = listenerTabArr[i];
                    for (let j = 0; j < listenerTab.length; ++j) {
                        if (listenerTab[j].context == context) {
                            listenerTab[j].count = 0;
                        }
                    }
                }
            });
        };
    
        /**
       * 通过 context 取消某个事件的所有订阅
       * @param event 事件key
        */
        removeAllListeners(event: T) {
            let listenerTabArr = this.event_listenerMap.get(event);
    
            if (!listenerTabArr) {
                return;
            }
            for (let i = 0; i < listenerTabArr.length; ++i) {
                let listenerTab = listenerTabArr[i];
                for (let j = 0; j < listenerTab.length; ++j) {
                    listenerTab[j].count = 0;
                }
            }
        };
    
        /**
       * 通过 context 查询某个事件的订阅数量
       * @param event 事件key
        */
        listeners(event: T) {
            let listenerTabArr = this.event_listenerMap.get(event);
    
            if (!listenerTabArr) {
                return 0;
            }
    
            let count = 0;
    
            for (let i = 0; i < listenerTabArr.length; ++i) {
                count += listenerTabArr[i].length;
            }
    
            return count;
        };
    
        /**
       * 查询监听是否已经订阅
       * @param event 事件key
       * @param handler 监听者
       * @param context handler中的this对象
        */
        listenerContain(event: T, handler: Function, context: any) {
            let listenerTabArr = this.event_listenerMap.get(event);
    
            if (!listenerTabArr) {
                return false;
            }
    
            for (let i = 0; i < listenerTabArr.length; ++i) {
                let listenerTab = listenerTabArr[i];
                for (let j = 0; j < listenerTab.length; ++j) {
                    if (listenerTab[j].handler == handler && listenerTab[j].context == context) {
                        return true;
                    }
                }
            }
    
            return false;
        };
    
        /**
       * 派发事件
       * @param event 事件key
       * @param ...
        */
        emit(event: T, ...data: any[]) {
            if (event === undefined) {
                throw new Error("派发无效事件");
            }
    
            let listenerTabArr = this.event_listenerMap.get(event);
            if (!listenerTabArr) {
                return 0;
            }
    
            let callCount = 0;
            let abort = false;
    
            for (let i = 0; i < listenerTabArr.length; ++i) {
                let listenerTab = listenerTabArr[i];
                for (let j = 0; j < listenerTab.length; ++j) {
                    let listener = listenerTab[j];
                    if (listener.count != 0) {
    
                        if (listener.count > 0) {
                            listener.count--;
                        }
                        callCount++;

                        abort = listener.handler.call(listener.context, ...data);
                        // 派发中断
                        if (abort === true) {
                            break;
                        }
                    }
                }
    
                // 派发中断
                if (abort === true) {
                    break;
                }
            }
    
            if(this._removeOnce(listenerTabArr) == 0) {
                this.event_listenerMap.delete(event);
            }
            
            return callCount;
        };
    
        /*
       * 清理
        */
        clear() {
            this.event_listenerMap.clear();
        };
    
        /******************************************************* private *******************************************************/

    
        /*
       * 移除无效事件监听
        */
        _removeOnce(listenerTabArr: EventListener[][]) {
            let count = 0;
            for (let i = 0; i < listenerTabArr.length; ++i) {
                let listenerTab = listenerTabArr[i];
                for(let j = listenerTab.length - 1; j >= 0; --j) {
                    if (listenerTab[j].count == 0) {
                        listenerTab.splice(j, 1);
                    }
                }
                count += listenerTab.length;
            }
            return count;
        };
    
        dump() {
            console.log("dump begin--------------------------------");

            this.event_listenerMap.forEach((listenerTabArr, event)=>{
                for (let i = 0; i < listenerTabArr.length; ++i) {
                    let listenerTab = listenerTabArr[i];
                    console.log("dump event:" + event, "priority:" + i, "count:" + listenerTab.length);
                }
            });

            console.log("dump end--------------------------------");
        };
}
