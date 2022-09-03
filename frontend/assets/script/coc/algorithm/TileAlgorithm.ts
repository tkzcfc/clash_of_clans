/*
 * Created: 2022-03-07 17:13:19
 * Author : fc
 * Description: 格子算法相关
 */


export class TileAlgorithm {

    // 格子宽高
    TILE_WIDTH : number;
    TILE_HEIGHT : number;
    TILE_WIDTH_HALF : number;
    TILE_HEIGHT_HALF : number;
    
    // 格子数量
    X_COUNT : number;
    Y_COUNT : number;

    // 原点坐标
    origin: cc.Vec2;

    // 绘制时偏移坐标
    drawOffsetPos: cc.Vec2
    
    constructor(w: number, h:number, xcount: number, ycount: number){
        this.TILE_WIDTH = w;
        this.TILE_HEIGHT = h;
        this.TILE_WIDTH_HALF = this.TILE_WIDTH * 0.5;
        this.TILE_HEIGHT_HALF = this.TILE_HEIGHT * 0.5;

        this.X_COUNT = xcount;
        this.Y_COUNT = ycount;

        // 原点坐标偏移
        this.origin = new cc.Vec2(0.0, this.TILE_HEIGHT_HALF);
        // 绘制时偏移坐标
        this.drawOffsetPos = new cc.Vec2(0, 0);
    }

    /** 将逻辑坐标转换为渲染坐标(平行西变形中心点)
    @param M 逻辑X坐标
    @param N 逻辑Y坐标
    */
    public calculateMapTilePos(M:number, N:number) {
        // x坐标 = 原点x坐标加上MN的差值乘以瓦块宽度的一半
        // y坐标 = 原点y坐标加上MN的和乘以瓦块高度的一半
        let x = this.origin.x + (M - N) * this.TILE_WIDTH_HALF;
        let y = this.origin.y + (M + N) * this.TILE_HEIGHT_HALF;

        return new cc.Vec2(x, y);
    }

    /** 将渲染坐标转换为逻辑坐标
    @param x 渲染x坐标
    @param y 渲染y坐标
    @return 逻辑坐标
    */
    public calculateLogicPos(x:number, y:number){
        let diff_x_doubel = (x - this.origin.x) * 2
        let diff_y_doubel = (y - this.origin.y) * 2

        let div_x = diff_x_doubel / this.TILE_WIDTH
        let div_y = diff_y_doubel / this.TILE_HEIGHT

        let M, N
        N = (div_y - div_x) * 0.5
        M = div_x + N

        M = Math.floor(M + 0.5)
        N = Math.floor(N + 0.5)

        return new cc.Vec2(M, N)
    }

    /**
     * 设置绘制偏移量
     * @param offsetx 偏移X
     * @param offsety 偏移Y
     */
    setDrawTileOffset(offsetx: number, offsety: number) {
        this.drawOffsetPos.x = offsetx;
        this.drawOffsetPos.y = offsety;
    }

    contain(x: number, y: number) {
        return (x >= 0 && x < this.X_COUNT && y >= 0 && y < this.Y_COUNT);
    }

    /**
     * @param X 绘制的逻辑起始坐标X
     * @param y 绘制的逻辑起始坐标Y
     * @param w 绘制的逻辑宽度
     * @param h 绘制的逻辑高度
     * @param callback 每一个格子的回调函数
     */
    drawTile(g: cc.Graphics, x: number, y: number, w: number, h: number, callback: (logicx: number, logicy: number, renderPos: cc.Vec2)=>void) {

        let fillColor = g.fillColor;
        let strokeColor = g.strokeColor;

        for(let i = x; i < w; ++i){
            for(let j = y; j < h; ++j){
                let vertexs : cc.Vec2[] = [
                    new cc.Vec2(-this.TILE_WIDTH_HALF, 0),
                    new cc.Vec2(0, -this.TILE_HEIGHT_HALF),
                    new cc.Vec2(this.TILE_WIDTH_HALF, 0),
                    new cc.Vec2(0, this.TILE_HEIGHT_HALF),
                ];

                let pos = this.calculateMapTilePos(i, j);
                for(let k = 0; k < vertexs.length; ++k){
                    vertexs[k].addSelf(pos);
                }
                
                
                g.fillColor = fillColor;
                g.strokeColor = strokeColor;

                if(callback){
                    callback(i, j, pos);
                }
                
                g.moveTo(vertexs[0].x + this.drawOffsetPos.x, vertexs[0].y + this.drawOffsetPos.y);
                g.lineTo(vertexs[1].x + this.drawOffsetPos.x, vertexs[1].y + this.drawOffsetPos.y);
                g.lineTo(vertexs[2].x + this.drawOffsetPos.x, vertexs[2].y + this.drawOffsetPos.y);
                g.lineTo(vertexs[3].x + this.drawOffsetPos.x, vertexs[3].y + this.drawOffsetPos.y);
                g.close();
        
                g.stroke();
                g.fill();
            }
        }
        
        g.fillColor = fillColor;
        g.strokeColor = strokeColor;

        // 每次绘制完毕请空偏移值
        this.setDrawTileOffset(0, 0);
    }
}
