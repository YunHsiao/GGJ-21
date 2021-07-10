import { _decorator, Component, Node, Vec3, MeshRenderer, Vec4 } from 'cc';
import { CharacterStates, fillCharacterParams, fillPlaneParams, PlaneStates, SequenceAnimationInfo } from './animation-data';
import { RigidCharacter } from './RigidCharacter';
import { RigidCharacterController } from './RigidCharacterController';
const { ccclass, property, menu } = _decorator;

const vel = new Vec3();

@ccclass('AnimationStateMachine')
class AnimationStateMachine {
    @property(MeshRenderer)
    model: MeshRenderer = null;

    @property([SequenceAnimationInfo])
    animInfo: SequenceAnimationInfo[] = [];

    state = 0;
    stagingParam = new Vec4();
    duration = 1;
}

@ccclass('Character.RigidCharacterAnimation')
@menu('demo/character/RigidCharacterAnimation')
export class RigidCharacterAnimation extends Component {
    @property(RigidCharacter)
    character: RigidCharacter = null!;
    @property(RigidCharacterController)
    characterController: RigidCharacterController = null!;

    @property(AnimationStateMachine)
    characterASM = new AnimationStateMachine();
    @property(AnimationStateMachine)
    planeASM = new AnimationStateMachine();

    onLoad () {
        fillCharacterParams(this.characterASM.animInfo);
        fillPlaneParams(this.planeASM.animInfo);
    }

    update (dt: number) {
        this.character.getVelocity(vel);
        this.setFrontDirection(this.characterASM.model.node, vel.z);
        this.setFrontDirection(this.planeASM.model.node, vel.z);

        // update time
        if (this.characterASM.duration) this.characterASM.stagingParam.w += dt / this.characterASM.duration;
        this.characterASM.model.material.setProperty('seqAnimParams', this.characterASM.stagingParam);
        if (this.planeASM.duration) this.planeASM.stagingParam.w += dt / this.planeASM.duration;
        this.planeASM.model.material.setProperty('seqAnimParams', this.planeASM.stagingParam);

        const curAnim = this.characterASM.animInfo[this.characterASM.state];
        if (curAnim.nextState >= 0 && this.characterASM.stagingParam.w > 1) {
            this.setState(curAnim.nextState);
        }

        if (this.character.onGround) {
            this.setState(CharacterStates.RUNNING);
        } else if (this.characterController.isFlying === 1) {
            this.setState(CharacterStates.GLIDING);
        } else {
            this.setState(CharacterStates.JUMPING);
        }
    }

    setFrontDirection (node: Node, dir: number) {
        const scale = node.scale;
        node.setScale(Math.abs(scale.x) * (dir > 0.1 ? 1 : -1), scale.y, scale.z);
    }

    setState (state: CharacterStates) {
        let planeState = this.planeASM.state === PlaneStates.GLIDING_END ? PlaneStates.GLIDING_END : PlaneStates.HIDDEN;
        if (this.isPlaying(this.characterASM.animInfo, state, CharacterStates.GLIDING)) {
            planeState = PlaneStates.GLIDING_START;
        } else if (this.isPlaying(this.characterASM.animInfo, this.characterASM.state, CharacterStates.GLIDING)) {
            planeState = PlaneStates.GLIDING_END;
        }
        if (!this.isPlaying(this.planeASM.animInfo, this.planeASM.state, planeState)) { // no chaining for now
            const planeAnim = this.planeASM.animInfo[planeState];
            this.planeASM.model.material.setProperty('mainTexture', planeAnim.texture);
            Vec4.copy(this.planeASM.stagingParam, planeAnim.params);
            this.planeASM.duration = planeAnim.duration;
            this.planeASM.state = planeState;
        }

        if (!this.isPlaying(this.characterASM.animInfo, this.characterASM.state, state)) {
            const characterAnim = this.characterASM.animInfo[state];
            this.characterASM.model.material.setProperty('mainTexture', characterAnim.texture);
            Vec4.copy(this.characterASM.stagingParam, characterAnim.params);
            this.characterASM.duration = characterAnim.duration;
            this.characterASM.state = state;
        }
    }

    // is the ASM current in the target animation chain?
    isPlaying (info: SequenceAnimationInfo[], current: number, target: number) {
        while (current !== target) {
            target = info[target].nextState;
            if (target < 0) return false;
        }
        return true;
    }
}
