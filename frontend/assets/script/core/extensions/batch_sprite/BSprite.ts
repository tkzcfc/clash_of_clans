import BatchAssembler2D from "./BatchAssembler2D";

const {ccclass, menu} = cc._decorator;

@ccclass
@menu("core/extensions/BSprite")
export default class BSprite extends cc.Sprite {
    _curRenderTexImpl: any = undefined;
    _sprIndex: number = 0;

    _resetAssembler() {
        let assembler = this._assembler = new BatchAssembler2D();

        assembler.init(this);
        // @ts-ignore
        this._updateColor();
        this.setVertsDirty();
    }
    
    _updateMaterial () {
        // cc.log("_updateMaterial==============================>>>>>");
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

                let ok = false;
                for (let index = 0; index < 8; index++) {
                    if (material.getProperty(`texture${index}`, 0) === textureImpl) {
                        ok = true;
                        this._sprIndex = index;
                        this.setVertsDirty();
                        break;                   
                    }
                }

                if(!ok) {
                    cc.log("BatchSprite: No Texture");
                    for (let index = 0; index < 8; index++) {
                        if(!material.getProperty(`texture${index}`, 0)) {
                            cc.error("Material setting error");
                        }
                    }
                }
            }
        }

        (cc.BlendFunc as any).prototype._updateMaterial.call(this);
    }
}

