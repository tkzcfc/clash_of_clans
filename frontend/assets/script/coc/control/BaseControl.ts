/*
 * Created: 2022-05-04 16:40:51
 * Author : fc
 * Description: 控制器基类
 */

import { GameLayer } from "../GameLayer";


export class BaseControl {
    gameLayer: GameLayer;

    initialize(gameLayer: GameLayer) {
        this.gameLayer = gameLayer;
    }

    canFocusOnClickUnit() {
        return true;
    }
}

