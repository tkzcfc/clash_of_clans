/*
 * Created: 2022-03-29 15:56:21
 * Author : fc
 * Description: 对ScrollView功能进行扩展，添加手指缩放功能
 */

const {ccclass, property, disallowMultiple} = cc._decorator;

function Midpoint(p1: cc.Vec2, p2: cc.Vec2) {
    return new cc.Vec2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
}


class TouchInfo {
    location: cc.Vec2;
    preLocation: cc.Vec2;
    id: number;

    constructor(id: number, location: cc.Vec2) {
        this.id = id;
        this.location = location;
        this.preLocation = location;
    }   
}

@ccclass()
export class ZoomView extends cc.Component {
    @property(cc.Node)
    contentNode: cc.Node;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView;

    minScale: number = 1;
    maxScale: number = 2.5;

    _touchs: TouchInfo[] = [];
    _idTouchMap: Map<number, TouchInfo> = new Map<number, TouchInfo>();

    // 最先按下的Touch id
    _touchBeginId: number = -1;

    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, (event)=>{
            let touches = event.getTouches();

            // 将新加入的手指触摸点加入列表管理
            for(let i = 0, j = touches.length; i < j; ++i) {
                let touch = touches[i];
                if(!this._idTouchMap.get(touch.getID())) {
                    let info = new TouchInfo(touch.getID(), this._convertToLocation(touch));
                    this._touchs.push(info);
                    this._idTouchMap.set(touch.getID(), info);
                }
            }

            // 当前只有一根手指，记录下他的id
            if(this._touchs.length == 1) {
                this._touchBeginId = this._touchs[0].id;
            }

            // 超过两根则截断事件
            if(this._touchs.length >= 2) {
                event.stopPropagation();
                event.stopPropagationImmediate();
            }
        }, this, true)

        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event)=>{
            let touches = event.getTouches();

            // 更新各个手指的触摸点
            for(let i = 0, j = touches.length; i < j; ++i) {
                let touch = touches[i];
                let info = this._idTouchMap.get(touch.getID());
                if(info) {
                    info.preLocation = info.location;
                    info.location = this._convertToLocation(touch);
                }
            }

            // 超过两根截断事件
            if(this._touchs.length >= 2) {
                event.stopPropagation();
                event.stopPropagationImmediate();
                this.onTouchMove();
            }
        }, this, true);

        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this, true);
    }

    touchNum(): number {
        return this._touchs.length;
    }

    onTouchEnd(event) {
        let touches = event.getTouches();
        let ok = false;

        // 从触摸列表中移除相应的记录
        for(let i = 0, j = touches.length; i < j; ++i) {
            let touch = touches[i];
            let info = this._idTouchMap.get(touch.getID());
            if(info) {
                if(!ok) {
                    ok = this._touchBeginId === info.id;
                }

                this._idTouchMap.delete(touch.getID());
                cc.js.array.remove(this._touchs, info);
            }
        }

        if(ok) {
            this._touchBeginId = -1;
        }
        else {
            // 当前触摸结束的手指不是第一根按下的手指，截断事件传递
            event.stopPropagation();
            event.stopPropagationImmediate();            
        }
    }

    _convertToLocation(touch: cc.Touch) {
        let scrollNode = this.scrollView.node;

        // 使用 convertToNodeSpace 有警告，以下逻辑等同于使用 convertToNodeSpace
        let pos = this.scrollView.node.convertToNodeSpaceAR(touch.getLocation());
        pos.x += scrollNode.anchorX * scrollNode.width;
        pos.y += scrollNode.anchorY * scrollNode.height;

        return pos;
    }
    
    // 缩放逻辑
    onTouchMove() {
        if(this._touchs.length != 2) {
            return;
        }

        let touch1 = this._touchs[0];
        let touch2 = this._touchs[1];

        let location1 = touch1.location;
        let location2 = touch2.location;
        let preLocation1 = touch1.preLocation;
        let preLocation2 = touch2.preLocation;
        
        let curDistance = (new cc.Vec2(location1.x - location2.x, location1.y - location2.y)).len();
        let preDistance = (new cc.Vec2(preLocation1.x - preLocation2.x, preLocation1.y - preLocation2.y)).len();

        // 没有变化
        if(curDistance === preDistance) {
            return;
        }

        // 计算新的缩放值
        let prevScale = this.contentNode.scale;
        let curScale = prevScale * curDistance / preDistance;

        // 缩放约束
        curScale = Math.max(curScale, this.minScale);
        curScale = Math.min(curScale, this.maxScale);

        // 计算焦点坐标
        let midPoint = Midpoint(location1, location2);
        this._setContainerZoomPos(curScale, midPoint);
    }

    /**
     * 设置缩放值
     * @param zoom 新的缩放值 
     * @param pos 缩放焦点坐标
     * @returns 
     */
    _setContainerZoomPos(zoom: number, pos: cc.Vec2) {
        if(Math.abs(this.contentNode.scale - zoom) <= Number.EPSILON) {
            return;
        }
        let pos1 = this.contentNode.convertToNodeSpaceAR(pos);
        
        this.contentNode.setScale(zoom);

        let pos2 = this.contentNode.convertToNodeSpaceAR(pos);

        let deltaX = (pos2.x - pos1.x) * zoom;
        let deltaY = (pos2.y - pos1.y) * zoom;

        // 更新内容节点size
        this.contentNode.parent.getComponent(cc.Layout).updateLayout();

        let offset = this.scrollView.getScrollOffset();
        this.scrollView.scrollToOffset(new cc.Vec2(-(offset.x + deltaX), offset.y + deltaY));        
    }
}



