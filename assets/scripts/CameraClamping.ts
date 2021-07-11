
import { _decorator, Component, Node, Vec3, director, Director, Collider } from 'cc';
const { ccclass, property } = _decorator;

const v3_1 = new Vec3();
let curLevel = 0;

@ccclass('CameraClamping')
export class CameraClamping extends Component {

    @property
    minY = 0;

    @property
    increment = 0.05;

    @property(Collider)
    gameOverCollider: Collider = null;
    @property(Collider)
    levelFinishedCollider: Collider = null;

    @property(Node)
    target: Node = null!;

    _offset = new Vec3();

    start () {
        Vec3.subtract(this._offset, this.node.worldPosition, this.target.worldPosition);
    }

    onEnable () {
        director.on(Director.EVENT_BEFORE_DRAW, this.followTarget, this);
        this.gameOverCollider?.on('onTriggerEnter', this.onGameOver, this);
        this.levelFinishedCollider?.on('onTriggerEnter', this.onLevelFinished, this);
    }

    onDisable () {
        director.off(Director.EVENT_BEFORE_DRAW, this.followTarget, this);
        this.gameOverCollider?.off('onTriggerEnter', this.onGameOver, this);
        this.levelFinishedCollider?.off('onTriggerEnter', this.onLevelFinished, this);
    }

    followTarget () {
        const wp = this.target.worldPosition;
        let z = this.node.worldPosition.z;
        if (z - wp.z > this._offset.z) {
            z = wp.z + this._offset.z;
        }
        z -= this.increment;
        v3_1.set(wp.x, wp.y, z).add3f(this._offset.x, this._offset.y, 0)
        v3_1.y = Math.max(v3_1.y, this.minY);
        this.node.worldPosition = v3_1;
    }

    onGameOver () {
        this.switchLevel(curLevel);
    }

    onLevelFinished () {
        this.switchLevel(++curLevel % 3);
    }

    switchLevel (level: number) {
        director.loadScene('level0' + (level + 1));
    }
}
