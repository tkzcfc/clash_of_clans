

export enum GameEvent {
    ////////////////////////////////////////// 通知事件 //////////////////////////////////////////
    // 点击空地
    ON_NTF_CLICK_EMPTY,
    // 点击单元
    ON_NTF_CLICK_UNIT,
    // 长按单元
    ON_NTF_LONG_TOUCH_UNIT,
    // 拖拽单元开始
    ON_NTF_DRAG_UNIT_START,
    // 拖拽单元
    ON_NTF_DRAG_UNIT,
    // 单元聚焦
    ON_NTF_FOCUS_UNIT,
    // 单元失焦
    ON_NTF_UNFOCUS_UNIT,
    // 更新格子数据
    ON_NTF_UPDATE_TILE_DATA,
    // 设置zIndex最大节点
    ON_NTF_SET_ZINDEX_NODE,


    ////////////////////////////////////////// 操作事件 //////////////////////////////////////////
    // 将某个unit设置为焦点元素
    DO_FOCUS_UNIT,
    // 取消unit焦点元素
    DO_UNFOCUS_UNIT,
    // 创建新的建筑
    DO_NEW_BUILD,
    // 删除unit
    DO_DEL_UNIT,

    // 中断失焦
    DO_BREAK_UNFOCUS,

    // 确认修改
    DO_CONFIRM_MODIFY,
    // 取消修改
    DO_CANCEL_MODIFY,
    // 保存地图修改
    DO_SAVA_MAP,
    
    // 让地图中重新排序里面的元素
    DO_UPDATE_SORT, 
}

