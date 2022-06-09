/*
 * Created: 2022-03-14 21:55:14
 * Author : fc
 * Description: TableView实现
 */


import TableViewDelegate from "./TableViewDelegate";
import TableViewItem from "./TableViewItem";

const {ccclass, property, disallowMultiple, requireComponent} = cc._decorator;


/**
 * 垂直方向布局方式
 */
 enum VerticalDirection{
     // 从下到上排列
    BOTTOM_TO_TOP,
    // 从上到下排列
    TOP_TO_BOTTOM,
};


/**
 * 水平方向布局方式
 */
 enum HorizontalDirection{
    // 从左往右排列
    LEFT_TO_RIGHT,
    // 从右往左排列
    RIGHT_TO_LEFT,
};

/**
 * 显示模式
 */
enum ShowMode {
    // 普通模式
    Normal,
    // 居中显示，当实际内容大小小于ScrollView节点大小时，自动增加四周留白距离将内容居中展示
    ShowCenter,
}



class Margin {
    top : number;
    bottom : number;
    left : number;
    right : number;

    constructor(t: number, b: number, l: number, r: number) {
        this.top = t;
        this.bottom = b;
        this.left = l;
        this.right = r;
    }
}


/**
 * item信息
 */
export class ItemInfo {
    // item范围
    rect: cc.Rect;
    // 所属列数
    xCount: number;
    // 所属行数
    yCount: number;
    // item类型
    type : number;
    constructor(x: number, y: number, rect: cc.Rect, type: number) {
        this.xCount = x;
        this.yCount = y;
        this.rect = rect;
        this.type = type;
    }
}


@ccclass()
@disallowMultiple()
@requireComponent(cc.ScrollView)
@requireComponent(TableViewDelegate)
export default class TableView extends cc.Component {

    @property({tooltip: "是否是垂直排列"})
    isVertical = true;

    @property({type: cc.Integer, tooltip: "一行显示个数", min: 1, max: 10000, step: 1})
    multiNum : number = 1;

    @property({type: [cc.Prefab], tooltip: "item预制体(至少一个)"})
    itemPrefabs : cc.Prefab[] = [];

    @property({tooltip: "左侧留白"})
    paddingLeft: number = 0;
    
    @property({tooltip: "右侧留白"})
    paddingRight: number = 0;
    
    @property({tooltip: "上方留白"})
    paddingTop: number = 0;
    
    @property({tooltip: "下方留白"})
    paddingBottom: number = 0;

    @property({tooltip: "相邻item之间水平间距"})
    spacingX: number = 0;
    @property({tooltip: "相邻item之间垂直间距"})
    spacingY: number = 0;


    @property({type: cc.Enum(HorizontalDirection), tooltip: "水平方向布局方式"})
    horizontalDirection: HorizontalDirection = HorizontalDirection.LEFT_TO_RIGHT;
    
    @property({type: cc.Enum(VerticalDirection), tooltip: "垂直方向布局方式"})
    verticalDirection: VerticalDirection = VerticalDirection.TOP_TO_BOTTOM;
    
    @property({type: cc.Enum(ShowMode), tooltip: "显示模式"})
    showMode: ShowMode = ShowMode.Normal;   


    // 四周留白
    private _margin: Margin = new Margin(0, 0, 0, 0);

    // item 信息相关
    private _itemInfos: ItemInfo[] = [];

    // item总数量
    private _totalItemNum: number = 0;
    // scrollView组件
    private _scrollView: cc.ScrollView = null;
    // TableViewDelegate组件
    private _delegate: TableViewDelegate = null;
    // 实际内容大小
    private _realContentSize: cc.Size;
    // 节点缓存池
    private _nodePools: cc.NodePool[] = [];
    // 总列数
    private _xCount: number = 0;
    // 总行数
    private _yCount: number = 0;
    // 当前处于显示状态的item
    private _showItems: Map<number, cc.Node> = new Map<number, cc.Node>();
    // TableViewItem更新的参数
    private _itemArgs: any;

        
    protected onLoad(): void {
        if(this.itemPrefabs.length < 1)
            cc.error("预制体数量至少一个");
        
        // 初始化节点池
        this._nodePools.length = this.itemPrefabs.length;
        for(let i = 0; i < this.itemPrefabs.length; ++i)
            this._nodePools[i] = new cc.NodePool();

        this._scrollView = this.getComponent(cc.ScrollView);
        this._delegate = this.getComponent(TableViewDelegate);

        this._scrollView.node.on("scrolling", function() {
            this._updateView();
        }, this);
    }

    protected onDestroy(): void {
        this._nodePools.forEach((poll)=>{
            poll.clear();
        });
    }

    
    ///////////////////////////////////////////////// public /////////////////////////////////////////////////

    public _onItemCreateCallback: Function = null;
    /**
     * 设置item创建时回调函数
     * @param callback 
     */
    public setOnItemCreateCallback(callback: Function) {
        this._onItemCreateCallback = callback;
    }

    public getDelegate() {
        return this._delegate;
    }

    ///////////////////////////////////////////////// public /////////////////////////////////////////////////
    
    /**
     * 重新加载列表
     * @param datas 
     * @param freeze 是否保持当前偏移值
     */
    public reload(datas ?: any, freeze?: boolean) {
        if(!this._scrollView) {
            cc.error("tableView还没有调用onLoad函数");
            return;
        }
        // 停止自动滚动
        this._scrollView.stopAutoScroll();
        // 获取当前偏移量
        let offset = this._scrollView.getScrollOffset();
        // 清空当前界面上的item

        let delInfos = [];
        this._showItems.forEach((node: cc.Node, index: number) => {
            delInfos.push({
                node: node,
                index: index
            });
        });

        //从高到低 放入缓存池，重复使用时index相同的概率更大
        delInfos.sort((a, b)=> b.index - a.index);
        delInfos.forEach((data)=>{
            this._putItemNode(this._itemInfos[data.index].type, data.node);
        });

        this._showItems.clear();

        this._itemArgs = datas;
        this._totalItemNum = this._delegate.numberOfItem();

        this._margin.left = this.paddingLeft;
        this._margin.right = this.paddingRight;
        this._margin.top = this.paddingTop;
        this._margin.bottom = this.paddingBottom;

        this._updateContentSize();
        
        if(this.showMode == ShowMode.ShowCenter) {
            // 内容大小
            const contentSize = this._scrollView.content.getContentSize();
            let halfw = (contentSize.width - this._realContentSize.width) * 0.5;
            let halfh = (contentSize.height - this._realContentSize.height) * 0.5;

            // 自动填充四周留白
            if(halfw > 0 || halfh > 0) {
                if(halfw > 0)
                {
                    this._margin.left += halfw;
                    this._margin.right += halfw;
                }
                if(halfh > 0)
                {
                    this._margin.top += halfh;
                    this._margin.bottom += halfh;
                }
                this._updateContentSize();
            }
        }
        
        // 更新item信息
        this._updateItemInfo();

        if(freeze) {
            offset.x = -offset.x;
            this._scrollView.scrollToOffset(offset);
        }
        else {
            // 默认自动定位到第一个item
            if(this.verticalDirection == VerticalDirection.TOP_TO_BOTTOM) {
                if(this.horizontalDirection == HorizontalDirection.LEFT_TO_RIGHT)
                    this._scrollView.scrollToTopLeft();
                else
                    this._scrollView.scrollToTopRight();
            }
            else {
                if(this.horizontalDirection == HorizontalDirection.LEFT_TO_RIGHT)
                    this._scrollView.scrollToBottomLeft();
                else
                    this._scrollView.scrollToBottomRight();
            }
        }

        // 界面刷新
        this._updateView();
    }
    
    /**
     * 将某个item滚动到视图的某个地方
     * @param index 
     * @param itemAnchor 决定item的对其锚点
     * @param viewAnchor 决定滚动到视图的某个地方 vec2(1, 1)则表示左上角  vec2(0.5, 0.5)表示滚动到中央
     */
    public scrollTo(index: number, itemAnchor ?: cc.Vec2, viewAnchor ?: cc.Vec2, timeInSecond?: number, attenuated?: boolean) {
        let offset = this.getScrollToOffset(index, itemAnchor, viewAnchor);
        this._scrollView.scrollToOffset(offset, timeInSecond, attenuated);
    }

    /**
     * 将某个item滚动到视图的某个地方
     * @param index 
     * @param itemAnchor 决定item的对其锚点
     * @param viewAnchor 决定滚动到视图的某个地方 vec2(1, 1)则表示左上角  vec2(0.5, 0.5)表示滚动到中央
     */
    public scrollToWithSpeed(index: number, itemAnchor ?: cc.Vec2, viewAnchor ?: cc.Vec2, speed?: number, attenuated?: boolean) {
        let offset = this.getScrollToOffset(index, itemAnchor, viewAnchor);
        let curOffset = this._scrollView.getScrollOffset();

        let distance = new cc.Vec2(curOffset.x - offset.x, curOffset.y - offset.y);
        this._scrollView.scrollToOffset(offset, distance.len() / speed, attenuated);
    }

    /**
     * 
     * @param index 
     * @param itemAnchor 决定item的对其锚点
     * @param viewAnchor 决定滚动到视图的某个地方 vec2(1, 1)则表示左上角  vec2(0.5, 0.5)表示滚动到中央
     */
    public getScrollToOffset(index: number, itemAnchor ?: cc.Vec2, viewAnchor ?) {
        let info = this._itemInfos[index];
        if(!info)
            return this._scrollView.getScrollOffset();

        if(!itemAnchor)
            itemAnchor = new cc.Vec2(0.5, 0.5);
        if(!viewAnchor)
            viewAnchor = new cc.Vec2(1, 1);

        let itemPos = new cc.Vec2(info.rect.x + info.rect.width * itemAnchor.x, info.rect.y + info.rect.height * itemAnchor.y);
        let viewPos = new cc.Vec2(viewAnchor.x * this.node.width, viewAnchor.y * this.node.height);

        let offsetMax = this._scrollView.getMaxScrollOffset();
        let contentNode = this._scrollView.content;

        let offset = new cc.Vec2(itemPos.x + contentNode.anchorX * contentNode.width, -(itemPos.y + contentNode.anchorY * contentNode.height- offsetMax.y));

        offset.x -= viewPos.x;
        offset.y += viewPos.y;

        return offset;
    }

    ///////////////////////////////////////////////// private /////////////////////////////////////////////////

    /**
     * 更新内容节点大小
     */
    private _updateContentSize() {
        let w: number = 0;
        let h: number = 0;
        
        this._xCount = 0;
        this._yCount = 0;

        let count = this._totalItemNum;
        if(count > 0) {
            // 垂直排列
            if(this.isVertical) {
                // X轴数量（总列数）
                this._xCount = this.multiNum;
                // Y轴数量（总行数）
                this._yCount = (this._totalItemNum % this.multiNum == 0) ? Math.floor(this._totalItemNum / this.multiNum) : Math.floor(this._totalItemNum / this.multiNum) + 1;

                while(count > 0) {
                    let maxh = 0;
                    let curw = 0;

                    for(let i = 0; i < this.multiNum; ++i) {
                        let size = this._getItemSize(this._totalItemNum - count);
                        curw += size.width;
                        maxh = Math.max(size.height, maxh);

                        if(--count <= 0)
                            break;
                    }

                    w = Math.max(curw, w);
                    h += maxh;
                }
            }
            // 水平排列
            else {
                // X轴数量（总列数）
                this._xCount = (this._totalItemNum % this.multiNum == 0) ? Math.floor(this._totalItemNum / this.multiNum) : Math.floor(this._totalItemNum / this.multiNum) + 1;
                // Y轴数量（总行数）
                this._yCount = this.multiNum;

                while(count > 0){
                    let maxw = 0;
                    let curh = 0;

                    for(let i = 0; i < this.multiNum; ++i) {
                        let size = this._getItemSize(this._totalItemNum - count);
                        curh += size.height;
                        maxw = Math.max(size.width, maxw);

                        if(--count <= 0)
                            break;
                    }

                    h = Math.max(curh, h);
                    w += maxw;
                }
            }
        }

        if(this._xCount > 0)
            w += (this._xCount - 1) * this.spacingX;
        if(this._yCount > 0)
            h += (this._yCount - 1) * this.spacingY;

        w += this._margin.left + this._margin.right
        h += this._margin.top + this._margin.bottom

        this._realContentSize = new cc.Size(w, h);

        const minSize = this.node.getContentSize();

        w = Math.max(minSize.width, w);
        h = Math.max(minSize.height, h);

        this._scrollView.content.setContentSize(w, h);
    }

    /**
     * 更新item信息
     */
    private _updateItemInfo() {
        // 内容节点
        const contentNode = this._scrollView.content;
        // 内容大小
        const contentSize = contentNode.getContentSize();
        // 清空信息
        this._itemInfos.length = 0;

        let signx = 1;
        let signy = 1;
        let startx = -contentNode.anchorX * contentNode.width;
        let starty = -contentNode.anchorY * contentNode.height;
        if(this.horizontalDirection == HorizontalDirection.RIGHT_TO_LEFT) {
            signx = -1;
            startx += contentSize.width;
            startx -= this._margin.right;
        }
        else {
            startx += this._margin.left;
        }

        if(this.verticalDirection == VerticalDirection.TOP_TO_BOTTOM) {
            signy = -1;
            starty += contentSize.height;
            starty -= this._margin.top;
        }
        else {
            starty += this._margin.bottom;
        }

        if(this.isVertical) {
            let centery = starty;
            for(let i = 0; i < this._yCount; ++i) {
                let centerx = startx;
                let maxH = 0;

                for(let j = 0; j < this._xCount; ++j){
                    let index = i * this._xCount + j;
                    if(index >= this._totalItemNum)
                        break;
                        
                    let itemSize = this._getItemSize(index);

                    let rect = new cc.Rect();
                    rect.size = itemSize;
                    rect.center = new cc.Vec2(centerx + signx * itemSize.width * 0.5, centery + signy * itemSize.height * 0.5);

                    this._itemInfos.push(new ItemInfo(j, i, rect, this._getItemType(index)));

                    maxH = Math.max(maxH, itemSize.height);
                    centerx += signx * itemSize.width;
                    centerx += signx * this.spacingX;
                }
                
                centery += signy * maxH;
                centery += signy * this.spacingY;
            }
        }
        else{
            let centerx = startx;
            for(let i = 0; i < this._xCount; ++i) {
                let centery = starty;
                let maxW = 0;
                for(let j = 0; j < this._yCount; ++j) {
                    let index = i * this._yCount + j;
                    if(index >= this._totalItemNum)
                        break;
                    
                    let itemSize = this._getItemSize(index);

                    let rect = new cc.Rect();
                    rect.size = itemSize;
                    rect.center = new cc.Vec2(centerx + signx * itemSize.width * 0.5, centery + signy * itemSize.height * 0.5);
                    
                    this._itemInfos.push(new ItemInfo(i, j, rect, this._getItemType(index)));
                    
                    maxW = Math.max(maxW, itemSize.width);                    
                    centery += signy * itemSize.height;
                    centery += signy * this.spacingY;
                }
                centerx += signx * maxW;
                centerx += signx * this.spacingX;
            }
        }
    }
    
    private _updateView() {
        if(this._itemInfos.length == 0)
            return 0;

        let offset = this._scrollView.getScrollOffset();
        let offsetMax = this._scrollView.getMaxScrollOffset();
        // 视图大小
        let viewSize = this.node.getContentSize();
        let contentNode = this._scrollView.content;

        let rect = new cc.Rect(
            -offset.x - contentNode.anchorX * contentNode.width,
            (offsetMax.y - offset.y) - contentNode.anchorY * contentNode.height,
            viewSize.width,
            viewSize.height
            )

        for(let i = 0, j = this._itemInfos.length; i < j; ++i){
            let info = this._itemInfos[i];
            let item = this._showItems.get(i);

            if(rect.intersects(info.rect)) {
                if(!item) {
                    let node = this._getItemNode(info.type, i);
                    contentNode.addChild(node);
                    node.setPosition((node.anchorX - 0.5) * node.width + info.rect.center.x, (node.anchorY - 0.5) * node.height + info.rect.center.y);
                    this._showItems.set(i, node);
                }
            }
            else {
                if(item) {
                    this._putItemNode(info.type, item);
                    this._showItems.delete(i);
                }
            }
        }
    }
    
    /**
     * 通过下标获取item大小
     * @param index item下标
     * @returns 
     */
    private _getItemSize(index: number): cc.Size {
        return this._delegate.getItemSize(index);
    }

    /**
     * 通过下标获取item的类型
     * @param index item下标
     * @returns 
     */
     private _getItemType(index: number):number {
        let type = this._delegate.getItemType(index);

        if(type >= this.itemPrefabs.length) {
            cc.error("此类型没有对应的预制体");
        }

        return type;
    }

    /**
     * 通过类型获取item的预制体
     * @param index 
     */
     private _getItemPrefab(type: number): cc.Prefab {
        let prefab = this.itemPrefabs[type];
        if(!prefab) {
            cc.error(`类型[${type}]的预制体不存在!!!!`);
        }
        return prefab;
    }

    /**
     * 放入节点缓存池中
     * @param type item类型
     * @param node 
     */
     private _putItemNode(type: number, node: cc.Node) {
        let item = node.getComponent(TableViewItem);
        if(item) {
            item.onRecycle();
            item.itemIndex = -1;
        }
        this._nodePools[type].put(node);
    }

    /**
     * 从节点缓存池中获取节点
     * @param type item类型
     * @param index item下标
     * @returns 
     */
    private _getItemNode(type: number, index: number) {
        let node = this._nodePools[type].get();
        let usePool = true;
        if(!node) {
            usePool = false;
            node = cc.instantiate(this._getItemPrefab(type));
        }

        let item = node.getComponent(TableViewItem);
        if(item) {
            item.itemIndex = index;
            if(!usePool) {
                item.onInitItem();
                if(this._onItemCreateCallback) {
                    this._onItemCreateCallback(item);
                }
            }
            item.onUpdateItem(this._itemArgs, this);
        }

        return node;
    }
}
