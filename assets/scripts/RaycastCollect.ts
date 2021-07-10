
import { _decorator, Component, Node, geometry, Vec3, PhysicsSystem, physics } from 'cc';
const { ccclass, property } = _decorator;
const _ray = new geometry.Ray();
@ccclass('RaycastCollect')
export class RaycastCollect extends Component {

    @property
    castDirection = new Vec3(0, 0, -1);

    @property({ type: physics.PhysicsGroup })
    castGroup = physics.PhysicsGroup.DEFAULT;

    @property
    maxCastDistance = 1.15;

    hitNormal = new Vec3(0, 1, 0);

    updateFunction () {
        _ray.d.set(this.castDirection);
        _ray.o.set(this.node.worldPosition);
        if (PhysicsSystem.instance.raycastClosest(_ray, this.castGroup, this.maxCastDistance, false)) {
            const r = PhysicsSystem.instance.raycastClosestResult;
            this.hitNormal.set(r.hitNormal);
        } else {
            this.hitNormal.set(Vec3.UNIT_Y);
        }
    }
}
