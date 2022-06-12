/*
 * Created: 2022-03-27 10:13:57
 * Author : fc
 * Description: 建筑信息-供编辑器调试使用
 */



import { GameContext } from "../misc/GameContext";
import { DrawTileMode, LogicTileType, DrawTileGroundType } from "../../logic/common/enums";

const {ccclass, property, executeInEditMode, requireComponent} = cc._decorator;


@ccclass()
@executeInEditMode()
export class BuildInfo_Editor extends cc.Component {

    @property({ type: cc.Sprite, tooltip: "建筑渲染节点"})
    buildRender: cc.Sprite;

    //////////////////////////////////////////////////////////////////////////
    @property({ type: cc.Integer, tooltip: "X轴数量" })
    get xCount() {
        return this._xCount;
    }
    
    set xCount(value) {
        value = Math.floor(value);
        if(value < 0) value = 1;
        this._xCount = value;
        this.updateDraw();
    }
  
    @property
    private _xCount = 1;
    
    //////////////////////////////////////////////////////////////////////////
    @property({ type: cc.Integer, tooltip: "Y轴数量" })
    get yCount() {
        return this._yCount;
    }
    
    set yCount(value) {
        value = Math.floor(value);
        if(value < 0) value = 1;
        this._yCount = value;
        this.updateDraw();
    }
  
    @property
    private _yCount = 1;
    
    //////////////////////////////////////////////////////////////////////////
    @property({ type: cc.Enum(DrawTileMode), tooltip: "绘制模式" })
    get drawTileMode() {
        return this._drawTileMode;
    }
    
    set drawTileMode(value) {
        this._drawTileMode = value;
        this.updateDraw();
    }
  
    @property
    private _drawTileMode = DrawTileMode.None;

    
    //////////////////////////////////////////////////////////////////////////
    // 建筑物逻辑格子类型
    @property({ type: cc.Enum(LogicTileType), tooltip: "建筑物逻辑格子类型" })
    get logicTileTypeArr() {
        return this._logicTileTypeArr;
    }
    
    set logicTileTypeArr(value) {
        this._logicTileTypeArr = value;
        this.updateDraw();
    }
  
    @property
    private _logicTileTypeArr = [];

    
    //////////////////////////////////////////////////////////////////////////
    // 地面绘制类型
    @property({type: cc.Enum(DrawTileGroundType), tooltip: "地面绘制类型"})
    get drawTileGroundType() {
        return this._drawTileGroundType;
    }
    
    set drawTileGroundType(value) {
        this._drawTileGroundType = value;
        this.updateBuildingGround();
    }
    _drawTileGroundType : DrawTileGroundType = DrawTileGroundType.Normal;

    //////////////////////////////////////////////////////////////////////////

    protected start (): void {
        this.updateDraw();
    }

    updateDraw() {
        // 更新/填充逻辑格子类型
        if(CC_EDITOR) {
            let newLen = this.xCount * this.yCount * GameContext.getInstance().LOGIC_SCALE * GameContext.getInstance().LOGIC_SCALE;
            if(this.logicTileTypeArr.length !== newLen){
                this.logicTileTypeArr.length = newLen;
                for(let i = 0; i < this.logicTileTypeArr.length; ++i){
                    if(this.logicTileTypeArr[i] == undefined){
                        this.logicTileTypeArr[i] = LogicTileType.buildings;
                    }
                }
            }
        }

        this.updateDrawTile();
        this.updateBuildingGround();
    }

    /**
     * 绘制逻辑格子相关
     * @returns 
     */
    updateDrawTile(){
        if(!CC_EDITOR)
            return;

        let draw_tile = this.node.getChildByName("draw_tile");
        if(!draw_tile)
            return;

        let g = draw_tile.getComponent(cc.Graphics);
        g.clear();

        switch(this._drawTileMode)
        {
            case DrawTileMode.None: {
                break;
            }
            case DrawTileMode.ShowLogicTile: {
                let algorithm = GameContext.getInstance().logicTileAlgorithm;
                let LOGIC_SCALE = GameContext.getInstance().LOGIC_SCALE

                let fillColor = g.fillColor;
                let strokeColor = g.strokeColor;

                algorithm.setDrawTileOffset(this.xCount * algorithm.TILE_WIDTH_HALF * LOGIC_SCALE, 0.0);
                algorithm.drawTile(g, 0, 0, this.xCount * LOGIC_SCALE, this.yCount * LOGIC_SCALE, (logicx: number, logicy: number, renderPos: cc.Vec2) =>{
                    let index = logicx + logicy * this.yCount * LOGIC_SCALE;
                    let type = this.logicTileTypeArr[index];

                    if(type & LogicTileType.walkable) {
                        g.fillColor = cc.Color.GREEN.clone();
                        g.strokeColor = cc.Color.GREEN.clone();
                        g.fillColor.a = 100;                        
                    }
                    else if(type & LogicTileType.buildings) {
                        g.fillColor = cc.Color.RED.clone();
                        g.strokeColor = cc.Color.RED.clone();
                        g.fillColor.a = 100;
                    }
                    else{
                        g.fillColor = fillColor;
                        g.strokeColor = strokeColor;                        
                    }
                });

                g.fillColor = fillColor;
                g.strokeColor = strokeColor;
                break;
            }
            case DrawTileMode.ShowRenderTile: {
                let algorithm = GameContext.getInstance().tileAlgorithm;
                algorithm.setDrawTileOffset(this.xCount * algorithm.TILE_WIDTH_HALF, 0.0);
                algorithm.drawTile(g, 0, 0, this.xCount, this.yCount, null);
                break;
            }
        };
    }

    /**
     * 更新建筑地面纹理
    */
    updateBuildingGround(){
        let build_ground = this.node.getChildByName("build_ground");
        build_ground.active = (this.drawTileGroundType != DrawTileGroundType.None)
        if(this.drawTileGroundType == DrawTileGroundType.None)
            return;

        let tag = "";
        if(this.drawTileGroundType == DrawTileGroundType.Effective) {
            tag = "yes_";
        }
        else if(this.drawTileGroundType == DrawTileGroundType.Invalid) {
            tag = "no_";
        }

        const algorithm = GameContext.getInstance().tileAlgorithm;
        build_ground.setPosition(this.xCount * algorithm.TILE_WIDTH_HALF, this.yCount * algorithm.TILE_HEIGHT_HALF);

        let url = `build_${this.xCount}_${this.yCount}_${tag}hd`;            
        cc.resources.load("common/build_num_num_hd", cc.SpriteAtlas, (err: any, atlas : cc.SpriteAtlas) => {
            build_ground.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(url);
        });
    }
}
