import { _decorator, Component, Node, Vec3 } from 'cc';
import { CharacterStates, PlaneStates, fillCharacterParams, fillPlaneParams } from './animation-data';
import { RigidCharacter } from './RigidCharacter';
import { RigidCharacterController } from './RigidCharacterController';
import { SequenceAnimationState } from './sequence-animation';
const { ccclass, property, menu } = _decorator;

const vel = new Vec3();

@ccclass('Character.RigidCharacterAnimation')
@menu('demo/character/RigidCharacterAnimation')
export class RigidCharacterAnimation extends Component {
    @property(RigidCharacter)
    character: RigidCharacter = null!;
    @property(RigidCharacterController)
    characterController: RigidCharacterController = null!;

    @property(SequenceAnimationState)
    characterASM = new SequenceAnimationState();
    @property(SequenceAnimationState)
    planeASM = new SequenceAnimationState();

    velAcc = 0;

    onLoad () {
        fillCharacterParams(this.characterASM.animInfo);
        fillPlaneParams(this.planeASM.animInfo);
    }

    update (dt: number) {
        this.character.getVelocity(vel);
        this.setFrontDirection(this.characterASM.model.node, vel.z);
        this.setFrontDirection(this.planeASM.model.node, vel.z);
        this.velAcc = this.velAcc * 0.5 + Math.abs(vel.y) * 0.5;

        // update time
        this.characterASM.tick(dt);
        this.planeASM.tick(dt);

        const curAnim = this.characterASM.animInfo[this.characterASM.state];
        if (curAnim.nextState >= 0 && this.characterASM.stagingParam.w > 1) {
            this.setState(curAnim.nextState); // switch to next state if finished
        } else if (this.character.onGround || this.velAcc < 0.001) {
            this.setState(CharacterStates.RUNNING);
        } else if (this.characterController.isFlying === 1) {
            this.setState(CharacterStates.GLIDING);
        } else {
            this.setState(CharacterStates.JUMPING);
        }

        this.characterASM.update();
        this.planeASM.update();
    }

    setFrontDirection (node: Node, dir: number) {
        const scale = node.scale;
        node.setScale(Math.abs(scale.x) * (dir > 0.2 ? 1 : -1), scale.y, scale.z);
    }

    setState (state: CharacterStates) {
        let planeState = PlaneStates.HIDDEN;
        if (this.characterASM.isPlaying(state, CharacterStates.GLIDING)) {
            planeState = PlaneStates.GLIDING_START;
        } else if (this.characterASM.isPlaying(this.characterASM.state, CharacterStates.GLIDING) ||
                   this.planeASM.isPlaying(this.planeASM.state, PlaneStates.GLIDING_END)) {
            planeState = PlaneStates.GLIDING_END;
        }

        this.planeASM.setState(planeState);
        this.characterASM.setState(state);
    }
}
