import { ccenum, _decorator, Texture2D, Vec4, MeshRenderer } from 'cc';
const { ccclass, property } = _decorator;

export enum PlaybackMode {
    LOCAL_LOOP,
    LOCAL_ONCE,
    GLOBAL_LOOP,
}
ccenum(PlaybackMode);

@ccclass('SequenceAnimationInfo')
export class SequenceAnimationInfo {
    @property(Texture2D)
    texture: Texture2D = null;

    params = new Vec4(4.1, 4, PlaybackMode.LOCAL_LOOP, 0);
    duration = 1;
    nextState = -1;
}

@ccclass('SequenceAnimationState')
export class SequenceAnimationState {
    @property(MeshRenderer)
    model: MeshRenderer = null;

    @property([SequenceAnimationInfo])
    animInfo: SequenceAnimationInfo[] = [];

    state = 0;
    stagingParam = new Vec4();
    duration = 1;

    isPlaying (target: number, current = this.state) {
        while (current !== target) {
            target = this.animInfo[target].nextState;
            if (target < 0) return false;
        }
        return true;
    }

    setState (newState: number) {
        if (!this.isPlaying(newState)) {
            const planeAnim = this.animInfo[newState];
            this.model.material.setProperty('mainTexture', planeAnim.texture);
            Vec4.copy(this.stagingParam, planeAnim.params);
            this.duration = planeAnim.duration;
            this.state = newState;
        }
    }

    tick (dt: number) {
        if (this.duration) this.stagingParam.w += dt / this.duration;
    }

    update () {
        this.model.material.setProperty('seqAnimParams', this.stagingParam);
    }
}

export interface ISequenceAnimationInfo {
    width: number;
    height: number;
    frames?: number;        // default to (w * h)
    mode?: PlaybackMode;    // default to LOCAL_LOOP
    startFrom?: number;     // default to 0, start playing from relative position [0 - 1]
    duration?: number;      // default to 1, how long (in seconds) will the clip lasts, zero pauses, negative rewinds
    nextState?: number;     // default to none
}

export function fillParams (src: ISequenceAnimationInfo, dst: SequenceAnimationInfo) {
    const duration = src.duration !== undefined ? src.duration : 1;
    const mode = src.mode !== undefined ? src.mode : PlaybackMode.LOCAL_LOOP;
    const frames = src.frames !== undefined ? src.frames : src.width * src.height;
    const startFrom = src.startFrom !== undefined ? src.startFrom : 0;
    const nextState = src.nextState !== undefined ? src.nextState : -1;

    dst.params.x = src.width + src.height * 0.1;
    dst.params.y = frames;
    dst.params.z = mode;
    dst.params.w = mode === PlaybackMode.GLOBAL_LOOP ? duration : startFrom;
    dst.duration = mode === PlaybackMode.GLOBAL_LOOP ? 0 : duration;
    dst.nextState = nextState;
}
