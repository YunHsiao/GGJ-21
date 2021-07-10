import { _decorator, Component, Vec3, Material, MeshRenderer, ccenum, Texture2D, Vec4 } from 'cc';
import { RigidCharacter } from './RigidCharacter';
const { ccclass, property, menu } = _decorator;

const vel = new Vec3();

enum AnimationStates {
    RUNNING,
    JUMPING,
    SLIDING,
    SLIDING_PREPARE,
    GLIDING,
    CLIMPING,
}
ccenum(AnimationStates);

@ccclass('cc.SequenceAnimationInfo')
class SequenceAnimationInfo {
    @property(Texture2D)
    texture: Texture2D = null;

    @property(Vec4)
    params = new Vec4(4, 1, 4, 10);
}

@ccclass('Character.RigidCharacterAnimation')
@menu('demo/character/RigidCharacterAnimation')
export class RigidCharacterAnimation extends Component {
    @property(RigidCharacter)
    character: RigidCharacter = null!;

    @property(MeshRenderer)
    sequenceAnim: MeshRenderer = null;

    @property([SequenceAnimationInfo])
    animInfos: SequenceAnimationInfo[] = [];

    _material: Material;
    _curState = AnimationStates.RUNNING;

    start () {
        this._material = this.sequenceAnim.material;
    }

    update (dt: number) {
        this.character.getVelocity(vel);
        const scale = this.sequenceAnim.node.scale;
        this.sequenceAnim.node.setScale(Math.abs(scale.x) * (vel.z < -0.1 ? -1 : 1), scale.y, scale.z);
        if (this.character.onGround) {
            this.setState(AnimationStates.RUNNING);
        } else {
            this.setState(AnimationStates.JUMPING);
        }
    }

    setState (state: AnimationStates) {
        if (this._curState === state) return;
        const animInfo = this.animInfos[state];
        this._material.setProperty('mainTexture', animInfo.texture);
        this._material.setProperty('seqAnimParams', animInfo.params);
        this._curState = state;
    }
}
