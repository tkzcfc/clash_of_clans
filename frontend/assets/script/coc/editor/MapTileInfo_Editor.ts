/*
 * Created: 2022-03-07 17:27:44
 * Author : fc
 * Description: 设置/绘制地图中的格子数据
 */

import { TileAlgorithm } from "../algorithm/TileAlgorithm";
import { GameDefine } from "../const/GameDefine";
import { GameContext } from "../misc/GameContext";
const {ccclass, property, executeInEditMode, requireComponent} = cc._decorator;

@ccclass()
@executeInEditMode()
@requireComponent(cc.Graphics)
export default class MapTileInfo_Editor extends cc.Component {
    //////////////////////////////////////////////////////////////////////////////////////////////
    // X数量
    @property
    get xCount() {
        return this._xCount;
    }
    
    set xCount(value) {
        value = Math.floor(value);
        if(value < 0) value = 1;
        this._xCount = value;
        this._tileAlgorithmDirty = true;
        this.doDraw();
    }
  
    @property(cc.Integer)
    private _xCount = 40;
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    // Y数量
    @property
    get yCount() {
        return this._yCount;
    }
    
    set yCount(value) {
        value = Math.floor(value);
        if(value < 0) value = 1;
        this._yCount = value;
        this._tileAlgorithmDirty = true;
        this.doDraw();
    }
  
    @property(cc.Integer)
    private _yCount = 40;

    
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 单个瓦块宽度
    @property
    get tileWidth() {
        return this._tileWidth;
    }
    
    set tileWidth(value) {
        if(value < 0) value = 1;
        this._tileWidth = value;
        this._tileAlgorithmDirty = true;
        this.doDraw();
    }
  
    @property(cc.Integer)
    private _tileWidth = 64;
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 单个瓦块高度
    @property
    get tileHeight() {
        return this._tileHeight;
    }
    
    set tileHeight(value) {
        if(value < 0) value = 1;
        this._tileHeight = value;
        this._tileAlgorithmDirty = true;
        this.doDraw();
    }
  
    @property(cc.Integer)
    private _tileHeight = 32;

    //////////////////////////////////////////////////////////////////////////////////////////////
    // 是否开启格子绘制
    @property
    get enableDrawGrid() {
        return this._enableDrawGrid;
    }
    
    set enableDrawGrid(value) {
        this._enableDrawGrid = value;
        this.doDraw();
    }
    private _enableDrawGrid: boolean = false;
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    // 是否开启格子坐标绘制
    @property
    get enableDrawTileText() {
        return this._enableDrawTileText;
    }
    
    set enableDrawTileText(value) {
        this._enableDrawTileText = value;
        this.doDraw();
    }
    private _enableDrawTileText: boolean = false;



    //////////////////////////////////////////////////////////////////////////////////////////////
    // 坐标绘制根节点
    _labelRootNode: cc.Node = null;

    // 是否需要更新算法
    _tileAlgorithmDirty: boolean = true;

    onLoad () {
        this.node.removeAllChildren(true);
    }

    start () {
        this.doDraw();
    }

    doDraw() {
        // 更新算法
        if(this._tileAlgorithmDirty){
            this._tileAlgorithmDirty = false;
            GameDefine.X_COUNT = this.xCount;
            GameDefine.Y_COUNT = this.yCount;
            GameDefine.TILE_WIDTH = this.tileWidth;
            GameDefine.TILE_HEIGHT = this.tileHeight;
            GameContext.getInstance().resetAlgorithm();
        }
        
        if(this._labelRootNode)
            this._labelRootNode.removeAllChildren(true);
        
        let g = this.getComponent(cc.Graphics);
        g.clear();
        // g.lineWidth = 1;
        // g.fillColor.fromHEX('#ff0000');

        if(!this.enableDrawGrid)
            return;

        let algorithm = new TileAlgorithm(GameDefine.TILE_WIDTH, GameDefine.TILE_HEIGHT, GameDefine.X_COUNT, GameDefine.Y_COUNT);
        algorithm.drawTile(g, 0, 0, algorithm.X_COUNT, algorithm.Y_COUNT, (logicx: number, logicy: number, renderPos: cc.Vec2)=>{
            if(this.enableDrawTileText) {
                this.addText(`(${logicx},${logicy})`, new cc.Vec3(renderPos.x, renderPos.y, 0.0));
            }
        });
    }

    addText(text:string, pos: cc.Vec3){
        // 创建坐标文字绘制根节点
        if(!this._labelRootNode) {
            this._labelRootNode = new cc.Node();
            this._labelRootNode.name = "textRoot";
            this._labelRootNode.parent = this.node;
        }

        let node = new cc.Node();
        node.parent = this._labelRootNode;
        node.position = pos;

        let l = node.addComponent(cc.Label);
        l.string = text;
        l.fontSize = 15;
        l.verticalAlign = cc.Label.VerticalAlign.CENTER;
        l.horizontalAlign = cc.Label.HorizontalAlign.CENTER;        
    }

}
