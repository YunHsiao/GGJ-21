
import { _decorator, Component, Node, Vec3, geometry, BoxCollider, ITriggerEvent } from 'cc';
const { ccclass, property, requireComponent } = _decorator;
const v3_0 = new Vec3();
@ccclass('ForceField')
@requireComponent(BoxCollider)
export class ForceField extends Component {

    @property
    strength = 100;

    @property
    direction = new Vec3(0, 0, 1);

    bounds = new geometry.AABB();
    boxCollider: BoxCollider = null;

    onLoad () {
        this.boxCollider = this.getComponent(BoxCollider);
    }

    onEnable () {
        this.boxCollider.on('onTriggerEnter', this.onTrigger, this);
        this.boxCollider.on('onTriggerStay', this.onTrigger, this);
        this.boxCollider.on('onTriggerExit', this.onTrigger, this);
    }

    start () {
        if (this.node.children.length > 0) {
            Vec3.transformQuat(this.direction, Vec3.UNIT_Z, this.node.children[0].worldRotation);
        }
        this.bounds.copy(this.boxCollider.worldBounds as any);
    }

    onDisable () {
        this.boxCollider.off('onTriggerEnter', this.onTrigger, this);
        this.boxCollider.off('onTriggerStay', this.onTrigger, this);
        this.boxCollider.off('onTriggerExit', this.onTrigger, this);
    }

    onTrigger (event: ITriggerEvent) {
        const attach = event.otherCollider.attachedRigidBody;
        if (attach && attach.isDynamic) {
            attach.applyForce(Vec3.multiplyScalar(v3_0, this.direction, this.strength));
        }
    }

}
