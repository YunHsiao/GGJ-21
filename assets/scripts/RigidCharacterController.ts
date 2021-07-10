import { _decorator, Component, Node, EventKeyboard, macro, systemEvent, SystemEvent, Quat, Vec3, Vec2, clamp, director } from 'cc';
import { RigidCharacter } from './RigidCharacter';
const { ccclass, property, menu } = _decorator;
const SystemEventType = SystemEvent.EventType;

enum ECT {
    CT_ROTATE = 1 << 1,
    CT_JUMP = 1 << 2,
    CT_RUSH = 1 << 4,
}

const quat_0 = new Quat();
const v3_0 = new Vec3();

@ccclass('Character.RigidCharacterController')
@menu('demo/character/RigidCharacterController')
export class RigidCharacterController extends Component {
    @property(RigidCharacter)
    character: RigidCharacter = null!;

    @property({ type: Node })
    currentOrient: Node = null!;

    @property({ type: Node })
    targetOrient: Node = null!;

    @property
    rotateFactor = 0.1;

    @property
    rotateEnable = false;

    @property
    moveEnable = false;

    @property
    moveFrameInterval = 3;

    @property
    moveInAir = false;

    @property
    moveConstant = true;

    @property
    inverseXZ = true;

    @property
    moveSpeed = 1;

    @property
    maxMoveSpeed = new Vec2(5, 10);

    @property
    flyThreshold = 1e-1;

    @property
    sencondaryJumpImpulse = new Vec3(0, 10, 0);

    @property
    gravity = new Vec2(-20, -10);

    @property
    jumpRate = 100;

    get canFly () { return this.flyThreshold > this.character.velocity.y; }

    /**
     * 1 << 0 can not move
     * 1 << 1 can not rotate
     * 1 << 2 can not jump
     */
    protected _constraint = 0;
    protected _jumping = false;
    protected _flying = 0; // 0 no second jump, 1 flying, 2 no more secondary jumping
    protected _stateX: number = 0;  // 1 positive, 0 static, -1 negative
    protected _stateZ: number = 0;
    protected _isShiftDown = false;
    protected _isAltDown = false;
    protected _isSpaceDown = false;
    protected _isCancelFlying = false;
    protected _startAccelerationTime = 0;
    protected _JumpRefreshTime = 0;

    protected onEnable () {
        systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.on(SystemEventType.KEY_UP, this.onKeyUp, this);
    }

    protected onDisable () {
        systemEvent.off(SystemEventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.off(SystemEventType.KEY_UP, this.onKeyUp, this);
    }

    protected onKeyDown (event: EventKeyboard) {
        if (event.keyCode == macro.KEY.w) {
            this._stateZ = 1;
        } else if (event.keyCode == macro.KEY.s) {
            this._stateZ = -1;
        } else if (event.keyCode == macro.KEY.a) {
            this._stateX = 1;
        } else if (event.keyCode == macro.KEY.d) {
            this._stateX = -1;
        } else if (event.keyCode == macro.KEY.space) {
            this._isSpaceDown = true;
        } else if (event.keyCode == macro.KEY.shift) {
            this._isShiftDown = true;
        } else if (event.keyCode == macro.KEY.alt) {
            this._isAltDown = true;
        }
    }

    protected onKeyUp (event: EventKeyboard) {
        if (event.keyCode == macro.KEY.w || event.keyCode == macro.KEY.s) {
            this._stateZ = 0;
        } else if (event.keyCode == macro.KEY.d || event.keyCode == macro.KEY.a) {
            this._stateX = 0;
        } else if (event.keyCode == macro.KEY.space) {
            this._isSpaceDown = false;
            this._isCancelFlying = true;
        } else if (event.keyCode == macro.KEY.shift) {
            this._isShiftDown = false;
        } else if (event.keyCode == macro.KEY.alt) {
            this._isAltDown = false;
        }
    }

    update (dtS: number) {
        const dt = 1000 / 60;
        this.updateCharacter(dt);

        // reset state
        this._isSpaceDown = false;
    }

    updateCharacter (dt: number) {
        this.character.updateFunction(dt);

        // on ground
        if (this.character.onGround) {
            this._JumpRefreshTime -= dt;
            if (this._JumpRefreshTime < 0) {
                if (this._jumping) this._constraint = 0;
                this._jumping = false;
                this._JumpRefreshTime = 0;
            }

            this._flying = 0;
            this.character.gravity = this.gravity.x;
            this.character.maxSpeed = this.maxMoveSpeed.x;
        }

        // jump
        if (this._isSpaceDown) {
            if (!(this._constraint & ECT.CT_JUMP)) {
                this.character.jump(0);
                this._jumping = true;
                this._JumpRefreshTime = this.jumpRate;
                this._constraint |= ECT.CT_JUMP;
            } else if (this._flying === 0 && this.canFly) {
                // fly, secondary jump
                this._flying = 1;
                this._isCancelFlying = false;
                this.character.gravity = this.gravity.y;
                this.character.maxSpeed = this.maxMoveSpeed.y;
                this.character.rigidBody.applyImpulse(this.sencondaryJumpImpulse);
            }
        } else if (this._flying === 1 && (this._isCancelFlying || this.character.contacted)) {
            this._flying = 2;
            this.character.gravity = this.gravity.x;
            this.character.maxSpeed = this.maxMoveSpeed.x;
        }

        // rotate
        if (this.rotateEnable) {
            if (!(this._constraint & ECT.CT_ROTATE) && !this._isAltDown) {
                const qm = this.currentOrient.rotation;
                const qf = this.targetOrient.rotation;
                if (!Quat.equals(qm, qf)) {
                    Quat.slerp(quat_0, qm, qf, this.rotateFactor);
                    this.currentOrient.worldRotation = quat_0;
                }
            }
        }

        // move
        if (this.moveEnable && director.getTotalFrames() % this.moveFrameInterval == 0) {
            if (!this.moveInAir && !this.character.onGround && this._flying !== 1) return;
            if (this.moveConstant) this._stateX = 1;
            if (this._stateX || this._stateZ) {
                this.inverseXZ ? v3_0.set(this._stateZ, 0, -this._stateX) : v3_0.set(this._stateX, 0, this._stateZ);
                v3_0.normalize();
                v3_0.negative();
                if (this.rotateEnable) {
                    this.targetOrient.forward = v3_0;
                    v3_0.set(this.currentOrient.forward);
                    v3_0.negative();
                    const qm = this.currentOrient.rotation;
                    const qf = this.targetOrient.rotation;
                    const rs = clamp(this.rotationScalar(qm, qf), 0, 1);
                    this.character.move(v3_0, this.moveSpeed * rs);
                } else {
                    this.character.move(v3_0, this.moveSpeed);
                }
            }
        }
    }

    rotationScalar (a: Quat, b: Quat) {
        const cosom = Math.abs(a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w);
        return cosom;
    }

    onClickJump () {
        this._isSpaceDown = true;
    }

}
