// Copyright 2021 Cao Gaoting<caogtaa@gmail.com>
// https://caogtaa.github.io
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * Date: 2020-07-24 11:44:36
 * LastEditors: GT<caogtaa@gmail.com>
 * LastEditTime: 2021-08-16 13:58:56
*/ 

declare interface Object {
	assign(obj1: Object, obj2: Object): Object;
}

declare function require(name: string): any;

/** 对creator.d.ts的补充, 后续从2.2.2版本中挖出来
*/
declare namespace cc {
	/** 对creator.d.ts的补充
	追加cc.Assembler方法
	*/
	export class Assembler {
		public _renderComp: cc.RenderComponent;
		public init(comp: cc.RenderComponent);
		public getVfmt();
		static public register(renderCompCtor, assembler);
	}

	export class RenderData {
		init(assembler: cc.Assembler);
		createQuadData(index, verticesFloats, indicesCount);
		createFlexData(index, verticesFloats, indicesCount, vfmt): cc.FlexBuffer;
		initQuadIndices(idata);

		vDatas;
		uintVDatas;
		iDatas;
		meshCount: number;
		_infos;
		_flexBuffer;
	}

	declare interface Game {
		_renderContext: WebGLRenderingContext;
	}

	declare interface Camera {
		position: cc.Vec2;
		render(): void;
	}

	declare interface Sprite {
		_spriteFrame: cc.SpriteFrame;
	}

	declare interface renderer {
		// _handle: any;		// 无效
	}

	declare interface Material {
		setProperty(name: string, value: any);
		// static getInstantiatedMaterial(material: Material, comp: RenderComponent): Material;	// 无效
	}

	/** 对creator.d.ts的补充
	creator.d.ts已经导出RenderComponent，此处追加一些方法和成员
	engine\cocos2d\core\components\CCRenderComponent.js
	*/
	declare interface RenderComponent {
		/**
		@param dirty dirty
		*/
		setVertsDirty(): void;

		disableRender(): void;

		markForRender(shouldRender: boolean): void;

		_activateMaterial(force: boolean = true): void;

		_vertsDirty: boolean;

		_assembler: cc.Assembler;

		_resetAssembler(): void;
	}	
	
	declare interface FlexBuffer {
		usedVertices: number;
        usedIndices: number;
        usedVerticesFloats: number;
		vData: Float32Array;
		uintVData: Uint32Array;
		iData: Uint16Array;

		reset();
		used(verticesCount: number, indicesCount: number);
		reserve(verticesCount: number, indicesCount: number);
	}

	// declare interface PhysicsManager {
	// 	_world: b2.World;
	// }

	export namespace Graphics {
		export class Point {
			x: number;
			y: number;
			dx: number;
			dy: number;
			dmx: number;
			dmy: number;
			flags: number;
			len: number;
		}
	}
}
