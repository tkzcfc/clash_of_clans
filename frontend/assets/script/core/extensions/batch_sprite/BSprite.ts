import BatchAssembler2D from "./BatchAssembler2D";

const {ccclass, menu} = cc._decorator;

@ccclass
@menu("core/extensions/BSprite")
export default class BSprite extends cc.Sprite {
    _curRenderTexImpl: any = undefined;
    _sprIndex: number = 0;

    start () {
        cc.resources.load("BatchSprMaterial", cc.Material, (err, assets: cc.Material)=>{
            this.setMaterial(0, assets);
        });
    }

    _resetAssembler() {
        let assembler = this._assembler = new BatchAssembler2D();

        assembler.init(this);
        // @ts-ignore
        this._updateColor();
        this.setVertsDirty();
    }
    
    _updateMaterial () {
        let texture = null;

        if (this.spriteFrame) {
            texture = this.spriteFrame.getTexture();
        }

        // make sure material is belong to self.
        let material = this.getMaterial(0);
        if (material) {
            let oldDefine = material.getDefine('USE_TEXTURE');
            if (oldDefine !== undefined && !oldDefine) {
                material.define('USE_TEXTURE', true);
            }
            let textureImpl = texture && texture.getImpl();
            if(textureImpl !== this._curRenderTexImpl) {
                this._curRenderTexImpl = textureImpl;

                if (material.getProperty('texture0', 0) === textureImpl) {
                    this._sprIndex = 0;
                    this.setVertsDirty();
                }
                else if (material.getProperty('texture1', 0) === textureImpl) {
                    this._sprIndex = 1;
                    this.setVertsDirty();
                }
                else if (material.getProperty('texture2', 0) === textureImpl) {
                    this._sprIndex = 2;
                    this.setVertsDirty();
                }
                else if (material.getProperty('texture3', 0) === textureImpl) {
                    this._sprIndex = 3;
                    this.setVertsDirty();
                }
                else if (material.getProperty('texture4', 0) === textureImpl) {
                    this._sprIndex = 4;
                    this.setVertsDirty();
                }
                else if (material.getProperty('texture5', 0) === textureImpl) {
                    this._sprIndex = 5;
                    this.setVertsDirty();
                }
                else if (material.getProperty('texture6', 0) === textureImpl) {
                    this._sprIndex = 6;
                    this.setVertsDirty();
                }
                else if (material.getProperty('texture7', 0) === textureImpl) {
                    this._sprIndex = 7;
                    this.setVertsDirty();
                }
                else {
                    cc.log("BatchSprite: No Texture");
                }
            }
        }

        (cc.BlendFunc as any).prototype._updateMaterial.call(this);
    }
}

