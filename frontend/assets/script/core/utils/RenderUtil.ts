/*
 * Created: 2022-04-02 10:56:49
 * Author : fc
 * Description: 
 */


export namespace RenderUtil {
    
    /**
     * 设置节点是否参与渲染，这儿使用设置 opacity == 0来实现隐藏
     * 使用active=false导致节点树重新遍历，比较消耗CPU
     * @param node 
     * @param show 
     */
    export function setNodeVisible(node: cc.Node, show: boolean) {
        node.opacity = show ? 255: 0;
    }
}

