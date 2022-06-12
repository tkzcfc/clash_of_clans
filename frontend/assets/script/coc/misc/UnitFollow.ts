/*
 * Created: 2022-03-28 11:17:16
 * Author : fc
 * Description: 节点跟随
 */



const {ccclass, property} = cc._decorator;

@ccclass()
export class UnitFollow extends cc.Component {
    // 跟随目标节点
    public followTarget: cc.Node = null;


    // 跟随距离
    set followDistance(value) {
        this._followDistance = value;
        this.updateDistance();
    }
    get followDistance() {
        return this._followDistance;
    }
    public _followDistance: cc.Vec2 = cc.Vec2.ZERO;


    // 基础偏移
    set baseOffset(value) {
        this._baseOffset = value;
        this.updateDistance();
    }
    get baseOffset() {
        return this._baseOffset;
    }
    _baseOffset : cc.Vec2 = cc.Vec2.ZERO;


    private _distance: cc.Vec2 = new cc.Vec2();

    /**
     * 
     * @param target 
     * @param followDistance 
     */
    initFollow(target: cc.Node, followDistance: cc.Vec2) {
        this.followTarget = target;
        this.followDistance = followDistance;
    }

    updateDistance() {
        this._distance.x = this._baseOffset.x + this._followDistance.x;
        this._distance.y = this._baseOffset.y + this._followDistance.y;
    }

    protected lateUpdate(dt: number): void {
        let position = this.followTarget.position;
        this.node.setPosition(position.x + this._distance.x, position.y + this._distance.y);
    }
}
