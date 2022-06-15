

// 物品类型
export enum UnitType {
    // 空地
    None = 0,
    // 建筑物
    buildings = 1 << 1,
    // // 障碍物
    // obstacles = 1 << 2,
    // // 装饰
    // decos = 1 << 3,
    // 角色
    Role = 1 << 4,
};

// 建筑类型
export enum BuildType {

}

// 逻辑格子类型
export enum LogicTileType {
    // 空格子
    None = 0,
    // 有建筑物
    buildings = 1 << 1,
    // 可以行走的
    walkable = 1 << 2,
    // 此处放置了建筑物且此处可以行走(为建筑物的空地)
    buildings_and_walkable = buildings | walkable,
}

// 物品类型
export enum ItemType {
    // 建筑
    buildings = 1,
    // 货币
    currency = 2,
}

// 游戏状态
export enum GameStatus {
    // 普通状态
    Normal,
    // 编辑状态
    Edit,
    // 战斗状态
    Fight,
    // 观察状态
    Observe
}

// 建筑来源
export enum BuildComeFrom {
    // 地图上面的
    MAP,
    // 新建的,来自仓库
    WAREHOUSE,
    // 新建的，来自商店
    SHOP,
}


// 角色朝向定义
export enum RoleDirection {
    Left,
    LeftBottom,
    LeftTop,
    Right,
    RightBottom,
    RightTop,
}

// 格子绘制模式
export enum DrawTileMode {
    // 都不绘制
    None,
    // 绘制逻辑格子
    ShowLogicTile,
    // 绘制渲染格子
    ShowRenderTile
}

// 绘制地面类型
export enum DrawTileGroundType {
    // 普通状态（绘制草坪）
    Normal,
    // 有效的（绿色格子）
    Effective,
    // 无效的（红色格子）
    Invalid,
    // 不绘制
    None
}

// 游戏层级
export enum GameZIndex {
    // 背景层
    BackgroundLayer = 0,
    // 建筑物草坪层
    LawnLayer,
    // 建筑物层
    UnitLayer,
    // 游戏内部UI层
    UILayer,

    Count
}
