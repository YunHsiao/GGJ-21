
import { _decorator, Component, Node, Vec3, director, Director } from 'cc';
const { ccclass, property } = _decorator;

const v3_1 = new Vec3();
const v3_2 = new Vec3();

@ccclass('CameraClamping')
export class CameraClamping extends Component {

    @property
    minY = 0;

    start () {
        const initialLocalY = this.node.position.y;
        director.on(Director.EVENT_BEFORE_DRAW, () => {
            this.node.getPosition(v3_1);
            v3_1.y = Math.min(v3_1.y, initialLocalY);
            this.node.setPosition(v3_1);

            this.node.getWorldPosition(v3_1);
            v3_1.y = Math.max(v3_1.y, this.minY);
            this.node.setWorldPosition(v3_1);
        });
    }
}
