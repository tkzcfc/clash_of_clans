/*
 * Created: 2022-04-01 17:07:38
 * Author : fc
 * Description: 角色类动态动画创建
 */


import { RoleDirection } from "../const/enums";

const {ccclass, property} = cc._decorator;



let DirectionScale = {
    [RoleDirection.Left] : 1,
    [RoleDirection.LeftBottom] : 1,
    [RoleDirection.LeftTop] : 1,
    [RoleDirection.Right] : -1,
    [RoleDirection.RightBottom] : -1,
    [RoleDirection.RightTop] : -1,
}

let DirectionNameMap = {
    [RoleDirection.Left] : "left",
    [RoleDirection.LeftBottom] : "leftbottom",
    [RoleDirection.LeftTop] : "lefttop",
    [RoleDirection.Right] : "left",
    [RoleDirection.RightBottom] : "leftbottom",
    [RoleDirection.RightTop] : "lefttop",
}

let DirectionNames = [
    "left",
    "leftbottom",
    "lefttop",
]



@ccclass
export default class GameRoleDynamicClip extends cc.Component {
    // 动画组件渲染节点
    render: cc.Node = null;
    // 动画组件
    animation: cc.Animation;
    // 图集引用
    atlas: cc.Asset = null;

    // 动画名称缓存
    cacheAnimStr: string = "";
    // 加载是否完成
    loadFinish: boolean = false;

    // 动作名称
    actName: string = "";
    // 朝向
    direction : RoleDirection = RoleDirection.Left;

    onLoad () {
        this.render = this.node.getChildByName("render");
        this.animation = this.render.getComponent(cc.Animation);
    }

    updatePlay() {
        this.playEx(this.actName, this.direction);
    }

    playEx(actName: string, direction: RoleDirection) {
        // 动画未加载完成
        if(!this.loadFinish) {
            return;
        }

        let str = `${actName}_${direction}`;
        if(this.cacheAnimStr === str) {
            return;
        }
        this.cacheAnimStr = str;

        this.animation.play(`${actName}_${DirectionNameMap[direction]}`);
        this.render.scaleX = DirectionScale[direction];
    }

    loadClip(plistFileName: string, names: string[]) {        
        cc.resources.load(`Anim/${plistFileName}_hd`, cc.SpriteAtlas, (err, atlas: cc.SpriteAtlas) => {
            if(err) {
                cc.log(`load fail : Anim/${plistFileName}_hd`);
                return;
            }
            
            this.atlas = atlas.addRef();

            let spriteFrames = atlas.getSpriteFrames();

            for(let i = 0, j = names.length; i < j; ++i) {
                let aniName = names[i];

                DirectionNames.forEach((value: string)=>{
                    let prefix = `${plistFileName}_${aniName}_${value}_`;

                    let frames = [];
                    spriteFrames.forEach((sprFrame: cc.SpriteFrame)=>{
                        if(sprFrame.name.search(prefix) != -1) {
                            frames.push(sprFrame);
                        }
                    });

                    frames.sort((a, b)=>{
                        return a.name.localeCompare(b.name);
                    });

                    let clip = cc.AnimationClip.createWithSpriteFrames(frames, 15);
                    clip.name = `${aniName}_${value}`;
                    clip.wrapMode = cc.WrapMode.Loop;
                    this.animation.addClip(clip);
                });
            }

            this.loadFinish = true;
            this.updatePlay();
        });
    }

    protected onDestroy(): void {
        if(this.atlas) {
            this.atlas.decRef();
            this.atlas = null;
        }
    }
}
