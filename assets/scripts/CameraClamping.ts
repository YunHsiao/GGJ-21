
import { _decorator, Component, Node, Vec3, director, Director } from 'cc';
const { ccclass, property } = _decorator;

const v3 = new Vec3();

@ccclass('CameraClamping')
export class CameraClamping extends Component {

    @property
    minY = 0;
    
    start () {
        director.on(Director.EVENT_BEFORE_DRAW, () => {
            this.node.getWorldPosition(v3);
            v3.y = Math.max(v3.y, this.minY);
            this.node.setWorldPosition(v3);
        });
    }
}
