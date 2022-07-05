/*
 * Created: 2022-04-02 16:25:19
 * Author : fc
 * Description: A*寻路
 * Ref: https://www.jianshu.com/p/65282bd32391
 */

import Stack from "../../core/utils/Stack";

// 上下左右四个正方向定义
enum direction {
	LEFT 	= 0,
	RIGHT 	= 1,
	TOP 	= 2,
	BOTTOM 	= 3
}

// 正方向偏移
let NeighborOffset = {
	[direction.LEFT] 	: [-1,  0 ], // 左
	[direction.RIGHT] 	: [1 ,  0 ], // 右
	[direction.TOP] 	: [0 ,  1 ], // 上
	[direction.BOTTOM] 	: [0 ,  -1], // 下
}

// 斜方向偏移
let SkewNeighbor = [
	{ offset : [-1,  1], relation : [ direction.LEFT, direction.TOP     ]},// 左上
	{ offset : [ 1,  1], relation : [ direction.RIGHT, direction.TOP    ]},// 右上
	{ offset : [-1, -1], relation : [ direction.LEFT, direction.BOTTOM  ]},// 左下
	{ offset : [ 1, -1], relation : [ direction.RIGHT, direction.BOTTOM ]},// 右下
]


let pow = Math.pow;
let abs = Math.abs;

class Node {
    x: number = 0;
    y: number = 0;
    parent: Node = null;
    // 从起始点到该点消耗值
    G: number = 0;
    // 从该点到目标的的预计消耗值
    H: number = 0;
    // F = G + H
    F: number = 0;

    set(x: number, y: number, parent: Node, G: number, H: number) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.G = G;
        this.H = H;
        this.F = G + H;
    }
}

function defaultCheckFunc(x: number, y: number) {
    return true;
}


export class AStar {
    // 节点缓存
    freeNodes: Stack<Node> = new Stack<Node>();
    // open表
    openset: Node[] = [];
    // close表
    closedset: Node[] = [];


    // 地图宽高
    mapw: number = 0;
    maph: number = 0;
    // 目标点
    toPos: cc.Vec2 = null;
    // 自定义检测函数
    check_func: Function = defaultCheckFunc;

    /**
     * 
     * @param mapw 地图宽
     * @param maph 地图高
     * @param from 起始点 x数值范围:[0,mapw)  y数值范围:[0,maph)
     * @param to 目的点 x数值范围:[0,mapw)  y数值范围:[0,maph)
     * @param check_func 自定义检测函数
     * @returns 路径点列表,为空则表示目标点不可达
     */
    run(mapw: number, maph: number, from: cc.Vec2, to: cc.Vec2, check_func: Function): cc.Vec2[] {
        this.reset();

        this.mapw = mapw;
        this.maph = maph;
        this.toPos = to;
        this.check_func = check_func;

        this.openset.push(this.allocNode(from.x, from.y, null));
        while(this.openset.length > 0) {
            let S = this.getBestNode();
            if(S.x == to.x && S.y == to.y) {
                // 寻路结束,找到目标点
                return this.result(S);
            }
            this.findNeighbor(S);
        }
        return [];
    }

    /**
     * 在openset中获取F值最小的节点,如果F相同则取最后添加的点
     */
    getBestNode() {
        let index = 0;
        let minNode = this.openset[0];

        for(let i = 1, j = this.openset.length; i < j; ++i) {
            let current = this.openset[i];
            if(minNode.F >= current.F) {
                index = i;
                minNode = current;
            }
        }

        this.openset.splice(index, 1);
        this.closedset.push(minNode);

        return minNode;
    }

    /**
     * 查找并添加邻居节点到openset
     */
    findNeighbor(node: Node) {
        let passDirection = [];
        let x: number;
        let y: number;

        for (const key in NeighborOffset) {
            if (Object.prototype.hasOwnProperty.call(NeighborOffset, key)) {
                const offset = NeighborOffset[key];
                x = node.x + offset[0];
                y = node.y + offset[1];
                if(this.check(x, y)) {
                    this.openset.push(this.allocNode(x, y, node));
                    passDirection[key] = true;
                }
                else {
                    passDirection[key] = this.checkEx(x, y);
                }
            }
        }

        // 斜方向寻路逻辑
        for (const key in SkewNeighbor) {
            if (Object.prototype.hasOwnProperty.call(SkewNeighbor, key)) {
                const data = SkewNeighbor[key];
                // 先查看有关联的点是否通过
                // 如:想从左上方通过必须左方向或者上方向能通过才行
                if (passDirection[data.relation[0]] || passDirection[data.relation[1]]) {
                    x = node.x + data.offset[0];
                    y = node.y + data.offset[1];
                    if(this.check(x, y)) {
                        this.openset.push(this.allocNode(x, y, node));
                    }
                }
            }
        }
    }

    /**
     * 通过回溯生成结果路径
     */
     result(S: Node) {
        let posArray: cc.Vec2[] = [];
        do {
            posArray.push(new cc.Vec2(S.x, S.y));
            S = S.parent;
        } while (S);

        posArray.reverse();
        return posArray;
     }

     /**
      * 检测点是否合法
      */
    check(x: number, y:number) {
        // 超出地图边界，不合法
        if(x < 0 || x >= this.mapw || y < 0 || y >= this.maph) {
            return false;
        }

        // 已经在open或close表中
        if(this.contain(this.openset, x, y) || this.contain(this.closedset, x, y)) {
            return false;
        }

        // 自定义检测函数
        return this.check_func(x, y);
    }

    // 检测点是否合法,不检查点是否在open表中
    checkEx(x: number, y: number) {
        // 超出地图边界，不合法
        if(x < 0 || x >= this.mapw || y < 0 || y >= this.maph) {
            return false;
        }

        // 已经在close表中
        if(this.contain(this.closedset, x, y)) {
            return false;
        }

        // 自定义检测函数
        return this.check_func(x, y);
    }

    // 检测点是否包含在列表中
    contain(list: Node[], x: number, y: number) {
        let node:Node;
        for(let i = 0, j = list.length; i < j; ++i) {
            node = list[i];
            if(node.x == x && node.y == y) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 寻路重置
     */
    reset() {
        this.openset.forEach((node)=>{
            this.freeNode(node);
        });
        this.closedset.forEach((node)=>{
            this.freeNode(node);
        });

        this.openset.length = 0;
        this.closedset.length = 0;
    }

    allocNode(x: number, y: number, parent: Node|null) {
        let node: Node;
        if(this.freeNodes.isEmpty()) {
            node = new Node();
        }
        else {
            node = this.freeNodes.pop();
        }

        node.set(x, y, parent,  (!!parent) ? parent.G + 1 : 0, this.H(x, y));
        return node;
    }

    freeNode(node: Node) {
        this.freeNodes.push(node);
    }

    /**
     * H值计算
     * @param x 
     * @param y 
     * @returns 
     */
    H(x: number, y: number) {
        // return abs(this.toPos.x - x) + abs(this.toPos.y - y)
        return pow(this.toPos.x - x, 2) + pow(this.toPos.y - y, 2);
    }
}


