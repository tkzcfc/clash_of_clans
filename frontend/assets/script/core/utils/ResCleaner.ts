// copied from Cocos engine souce code.
function visitAsset (asset: cc.Asset, deps: string[]) {
    // assets generated programmatically or by user (e.g. label texture)  动态合图产生的纹理、字体纹理
    if (!asset['_uuid']) {
        if (asset instanceof cc.SpriteFrame) {
            const SpriteFrame = asset
            if (SpriteFrame['_original']) {
                const texture = SpriteFrame['_original']._texture;
                texture && deps.push(texture._uuid);;
            } else {
                const texture = SpriteFrame.getTexture();
                texture && deps.push(texture['_uuid']);;
            }
        }
        return;
    }
    deps.push(asset['_uuid']);
}

function visitComponent (comp: cc.Component, deps: string[]) {
    const props = Object.getOwnPropertyNames(comp);
    for (let i = 0; i < props.length; i++) {
        const propName = props[i];
        if (propName === 'node' || propName === '__eventTargets') { continue; }
        const value = comp[propName];
        if (value instanceof cc.NodePool) {
            visitNodePool(value, deps);
        } else 
        if (typeof value === 'object' && value) {
            if (Array.isArray(value)) {
                for (let j = 0; j < value.length; j++) {
                    const val = value[j];
                    if (val instanceof cc.Asset) {
                        visitAsset(val, deps);
                    }
                }
            } else if (!value.constructor || value.constructor === Object) {
                const keys = Object.getOwnPropertyNames(value);
                for (let j = 0; j < keys.length; j++) {
                    const val = value[keys[j]];
                    if (val instanceof cc.Asset) {
                        visitAsset(val, deps);
                    }
                }
            } else if (value instanceof cc.Asset) {
                visitAsset(value, deps);
            }
        }
    }
}

function visitNode (node: any, deps: string[]) {
    for (let i = 0; i < node._components.length; i++) {
        visitComponent(node._components[i], deps);
    }
    for (let i = 0; i < node._children.length; i++) {
        visitNode(node._children[i], deps);
    }
}

function visitNodePool(nodePool: cc.NodePool, deps: string[]) {
    const pool: Node[] = nodePool['_pool']
    for (let j = 0; j < pool.length; j++) {
        const node = pool[j];
        visitNode(node, deps);
    }
}

export class ResCleaner {
    /**
    * 资源清理 
    */
    static clean() {
        // return;
        cc.warn('--->资源释放 开始')
        let start = Date.now()

        let depsdeps: string[] = []
        let assetsCache = cc.assetManager.assets

        // 统计场景引用到的资源
        let nodeList = cc.director.getScene().children
        for (let i = 0; i < nodeList.length; i++) {
            visitNode(nodeList[i], depsdeps)
        }

        // 不需要处理加载中的资源，引擎在加载中会自动加引用计数
        // 也不需要处理内置资源

        // 场景引用的资源引用加一
        depsdeps.forEach(uuid => {
            let asset = assetsCache.get(uuid)
            asset && asset.addRef()
        });

        cc.assetManager['releaseUnusedAssets']()

        // 恢复资源的引用计数
        depsdeps.forEach(uuid => {
            let asset = assetsCache.get(uuid)
            asset && asset.decRef()
        });
        
        let timeSpan = Date.now() - start
        cc.warn('---资源统计耗时：', timeSpan, 'ms')

        let InitCount = assetsCache.count;
       setTimeout(() => {
           cc.warn('资源大约释放数量：', InitCount - assetsCache.count);
            // 尝试触发GC
            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                window['wx'].triggerGC && window['wx'].triggerGC();
            }
       }, 100);
    }
}

// 方便在控制台调用
window['cc']['ResCleaner'] = ResCleaner