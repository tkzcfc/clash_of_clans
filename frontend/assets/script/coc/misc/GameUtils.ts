import { RoleDirection } from "../const/enums";

export namespace GameUtils {

    export function bitGet(b, flag) {
        return b & flag;
    }
    
    export function bitSet(b, flag) {
        return b | flag;
    }

    export function bitDel(b, flag) {
       return b & (~flag); 
    }

    
    export function randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    export function randomRangeInt(min, max) {
        return Math.floor(randomRange(min, max));
    }

    /**
     * 获取从一个点到另一个点的角色朝向
     * @param from 起始点
     * @param to 目的点
     * @returns 角色朝向
     */
    export function getRoleDirection(from, to) {
        let subx = from.x - to.x;
        let suby = from.y - to.y;

        if(suby == 0) {
            if(subx > 0) {
                return RoleDirection.LeftBottom;
            }
            else {
                return RoleDirection.RightTop;
            }
        }
        
        if(subx == 0) {
            if(suby > 0) {
                return RoleDirection.Right;
            }
            else {
                return RoleDirection.Left;
            }
        }

        if(subx > 0) {
            if(suby > 0) {
                return RoleDirection.LeftBottom;
            }
            return RoleDirection.LeftTop;
        }
        else {
            if(suby > 0) {
                return RoleDirection.RightBottom;
            }
            return RoleDirection.RightTop;            
        }
    }

}

