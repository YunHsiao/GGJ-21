
import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
const v3_0 = new Vec3();
@ccclass('StablizationHack')
export class StablizationHack extends Component {

    @property(Node)
    target: Node = null!;

    @property(Node)
    map: Node = null!;

    @property
    offset = 100;

    updateFunction () {
        const wp = this.target.worldPosition;
        if (Math.abs(wp.z) > this.offset) {
            this.target.worldPosition = v3_0.set(wp.x, wp.y, wp.z > 0 ? wp.z - this.offset : wp.z + this.offset);
            const wp2 = this.map.worldPosition;
            this.map.worldPosition = v3_0.set(wp2.x, wp2.y, wp.z > 0 ? wp2.z - this.offset : wp2.z + this.offset);
        }
    }
}
