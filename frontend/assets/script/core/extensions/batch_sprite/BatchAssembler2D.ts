

import GTAutoFitSpriteAssembler2D from "../assembler_2d/GTAutoFitSpriteAssembler2D";

//@ts-ignore
let gfx = cc.gfx;
var vfmtCustom = new gfx.VertexFormat([
    { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
    { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },        // texture纹理uv
    { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },
    { name: "a_index", type: gfx.ATTR_TYPE_FLOAT32, num: 1 },
]);

export default class BatchAssembler2D extends GTAutoFitSpriteAssembler2D {
    // 根据自定义顶点格式，调整下述常量
    verticesCount = 4;// 四个顶点
    indicesCount = 6; // 6个下标组成两个三角形


    uvOffset = 2;
    colorOffset = 4;
    indexOffset = 5;
    
    // 此处注意颜色占1个字节
    floatsPerVert = 6; // 2 + 2 + 1 + 1

    initData() {
        let data = this._renderData;

        // createFlexData支持创建指定格式的renderData
        data.createFlexData(0, this.verticesCount, this.indicesCount, this.getVfmt());

        // createFlexData不会填充顶点索引信息，手动补充一下
        let indices = data.iDatas[0];
        let count = indices.length / 6;
        for (let i = 0, idx = 0; i < count; i++) {
            let vertextID = i * 4;
            indices[idx++] = vertextID;
            indices[idx++] = vertextID+1;
            indices[idx++] = vertextID+2;
            indices[idx++] = vertextID+1;
            indices[idx++] = vertextID+3;
            indices[idx++] = vertextID+2;
        }
    }

    // 自定义格式以getVfmt()方式提供出去，除了当前assembler，render-flow的其他地方也会用到
    getVfmt() {
        return vfmtCustom;
    }

    // 重载getBuffer(), 返回一个能容纳自定义顶点数据的buffer
    // 默认fillBuffers()方法中会调用到
    getBuffer(renderer) {
        return renderer.getBuffer('mesh', this.getVfmt());
        //@ts-ignore
        // return cc.renderer._handle.getBuffer("mesh", this.getVfmt());
    }

    updateSprIndex(comp) {
        let sprIndex = comp._sprIndex;
        let indexOffset = this.indexOffset;
        let floatsPerVert = this.floatsPerVert;
        let verts = this._renderData.vDatas[0];
        for (let i = 0; i < 4; i++) {
            let dstOffset = floatsPerVert * i + indexOffset;
            verts[dstOffset] = sprIndex;
        }
        // cc.log(`sprIndex = ${sprIndex}`);
    }
    
    updateRenderData(comp) {
        if (comp._vertsDirty) {
            this.updateUVs(comp);
            this.updateVerts(comp);

            // CCRenderComponent._updateColor自动调用
            // this.updateColor(comp, comp.node.color);

            this.updateSprIndex(comp)
            comp._vertsDirty = false;
        }
    }
}
