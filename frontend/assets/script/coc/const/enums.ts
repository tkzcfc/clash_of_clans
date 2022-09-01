
// 建筑类型
export enum BuildType {
}

// 
export enum UnitType {
    None = 0,
    // 建筑
    Buildings,
    // 人物
    Role,
}

// 逻辑格子类型
export enum LogicTileType {
    None = 0,

    // 建筑
    Buildings = 1 << 0,
    // 可以行走的
    Walkable = 1 << 1,
    
    // 10+
    // 角色
    Role = 1 << 10,
}

// 物品类型
export enum ItemType {
    // 建筑
    buildings = 1,
    // 货币
    currency = 2,
}

// 游戏模式
export enum GameMode {
    // 普通模式
    Normal,
    // 战斗模式
    Fight,
    // 观察模式
    Observe,
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
