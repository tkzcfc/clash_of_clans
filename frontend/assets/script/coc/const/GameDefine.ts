
export module GameDefine{
    /**
     * 细分倍数
     */ 
    export const LOGIC_SCALE: number = 2;
    /**
     * 渲染X轴格子数量
     */
    export let X_COUNT: number = 40;
    /**
     * 渲染Y轴格子数量
     */
    export let Y_COUNT: number = 40;    
    /**
     * 格子宽度
     */
    export let TILE_WIDTH: number = 64;
    /**
     * 格子高度
     */
    export let TILE_HEIGHT: number = 32;

    
    /**
     * 逻辑X轴格子数量
     */
    export let LOGIC_X_COUNT: number = Math.floor(X_COUNT * LOGIC_SCALE);
    /**
     * 逻辑Y轴格子数量
     */
    export let LOGIC_Y_COUNT: number = Math.floor(Y_COUNT * LOGIC_SCALE);
    /**
     * 逻辑格子宽度
     */
    export let LOGIC_TILE_WIDTH: number = Math.floor(TILE_WIDTH / LOGIC_SCALE);
    /**
     * 逻辑格子高度
     */
    export let LOGIC_TILE_HEIGHT: number = Math.floor(TILE_HEIGHT / LOGIC_SCALE);
}

