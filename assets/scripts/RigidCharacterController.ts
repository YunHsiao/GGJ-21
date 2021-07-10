import { _decorator, Component, Node, EventKeyboard, macro, systemEvent, SystemEvent, Quat, Vec3, Vec2, clamp } from 'cc';
import { RigidCharacter } from './RigidCharacter';
const { ccclass, property, menu } = _decorator;
const SystemEventType = SystemEvent.EventType;

enum ECT {
    CT_MOVE = 1 << 0,
    CT_ROTATE = 1 << 1,
    CT_JUMP = 1 << 2,
    CT_RUN = 1 << 3,
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
    inverseXZ = true;

    @property
    speed = new Vec2(); // x for walk, y for run

    @property
    decayRate = 0.025;

    @property
    jumpRate = 100;

    /**
     * 1 << 0 can not move
     * 1 << 1 can not rotate
     * 1 << 2 can not jump
     * 1 << 3 can not run
     * 1 << 4 can not rush
     */
    protected _constraint = 0;
    protected _jumping = false;
    protected _walking = false;
    protected _running = false;
    protected _stateX: number = 0;  // 1 positive, 0 static, -1 negative
    protected _stateZ: number = 0;
    protected _isShiftDown = false;
    protected _isAltDown = false;
    protected _isSpaceDown = false;
    protected _speed = 0;
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
        } else if (event.keyCode == macro.KEY.shift) {
            this._isShiftDown = false;
        } else if (event.keyCode == macro.KEY.alt) {
            this._isAltDown = false;
        }
    }

    update (dtS: number) {
        const dt = 1000 / 60;

        // const mx = this.mobileRocker.moveX;
        // const mz = this.mobileRocker.moveZ;
        // if ((globalThis as any).CC_BYTEDANCE || sys.isMobile || mx || mz) {
        //     this._stateX = mx; this._stateZ = mz;
        // }

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
        }

        // jump
        if (!(this._constraint & ECT.CT_JUMP) && this._isSpaceDown) {
            this.character.jump(0);
            this._jumping = true;
            this._JumpRefreshTime = this.jumpRate;
            this._constraint |= ECT.CT_JUMP + ECT.CT_RUN + ECT.CT_ROTATE;
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
                if (!(this._constraint & ECT.CT_RUN)) {
                    this._speed = this.speed.y;
                } else if (!(this._constraint & ECT.CT_MOVE)) {
                    this._speed = this.speed.x;
                }
                this.character.move(v3_0, this._speed * rs);
            } else {
                this.character.move(v3_0, this._speed);
            }
        } else {
            this._speed -= this.decayRate;
            this._walking = false;
            this._running = false;
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
