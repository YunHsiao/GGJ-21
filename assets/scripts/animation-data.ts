import { ccenum, _decorator, Texture2D, Vec4 } from 'cc';
const { ccclass, property } = _decorator;

export enum CharacterStates {
    RUNNING,
    JUMPING,
    SLIDING,
    SLIDING_LOOP,
    GLIDING,
    GLIDING_LOOP,
}
ccenum(CharacterStates);

export enum PlaneStates {
    HIDDEN,
    GLIDING_START,
    GLIDING_END,
}
ccenum(PlaneStates);

enum PlaybackMode {
    LOCAL_LOOP,
    LOCAL_ONCE,
    GLOBAL_LOOP,
}

@ccclass('SequenceAnimationInfo')
export class SequenceAnimationInfo {
    @property(Texture2D)
    texture: Texture2D = null;

    params = new Vec4(4.1, 4, PlaybackMode.LOCAL_LOOP, 0);
    playbackSpeed = 1;
    nextState = -1;
}

interface IAnimationInfo {
    width: number;
    height: number;
    frames?: number;        // default to (w * h)
    mode?: PlaybackMode;    // default to LOCAL_LOOP
    startFrom?: number;     // default to 0
    playbackSpeed?: number; // default to 1
    nextState?: number;     // default to none
}

const characterAnimInfoMap: Record<CharacterStates, IAnimationInfo> = {
    [CharacterStates.RUNNING]: {
        width: 4, height: 1,
        mode: PlaybackMode.GLOBAL_LOOP,
    },
    [CharacterStates.JUMPING]: {
        width: 4, height: 1,
        mode: PlaybackMode.GLOBAL_LOOP,
    },
    [CharacterStates.SLIDING]: {
        width: 5, height: 1,
        mode: PlaybackMode.LOCAL_ONCE,
        nextState: CharacterStates.SLIDING_LOOP,
    },
    [CharacterStates.SLIDING_LOOP]: {
        width: 2, height: 1,
        mode: PlaybackMode.LOCAL_LOOP,
    },
    [CharacterStates.GLIDING]: {
        width: 2, height: 2,
        mode: PlaybackMode.LOCAL_ONCE,
        playbackSpeed: 2,
        nextState: CharacterStates.GLIDING_LOOP,
    },
    [CharacterStates.GLIDING_LOOP]: {
        width: 5, height: 4, frames: 19,
        mode: PlaybackMode.LOCAL_LOOP,
        playbackSpeed: 2,
    },
};

const planeAnimInfoMap: Record<PlaneStates, IAnimationInfo> = {
    [PlaneStates.HIDDEN]: {
        width: 3, height: 6,
        mode: PlaybackMode.LOCAL_ONCE,
        startFrom: 1,
        playbackSpeed: 0,
    },
    [PlaneStates.GLIDING_START]: {
        width: 3, height: 6,
        mode: PlaybackMode.LOCAL_ONCE,
        startFrom: 1,
        playbackSpeed: -4,
    },
    [PlaneStates.GLIDING_END]: {
        width: 3, height: 6,
        mode: PlaybackMode.LOCAL_ONCE,
        playbackSpeed: 4,
    },
};

function fillParams (src: IAnimationInfo, dst: SequenceAnimationInfo) {
    const speed = src.playbackSpeed !== undefined ? src.playbackSpeed : 1;
    const mode = src.mode !== undefined ? src.mode : PlaybackMode.LOCAL_LOOP;
    const frames = src.frames !== undefined ? src.frames : src.width * src.height;
    const startFrom = src.startFrom !== undefined ? src.startFrom * frames : 0;
    const nextState = src.nextState !== undefined ? src.nextState : -1;

    dst.params.x = src.width + src.height * 0.1;
    dst.params.y = frames;
    dst.params.z = mode;
    dst.params.w = mode === PlaybackMode.GLOBAL_LOOP ? speed : startFrom;
    dst.playbackSpeed = mode === PlaybackMode.GLOBAL_LOOP ? 0 : speed;
    dst.nextState = nextState;
}

export function fillCharacterParams (infos: SequenceAnimationInfo[]) {
    for (let i = 0; i < infos.length; ++i) {
        fillParams(characterAnimInfoMap[i], infos[i]);
    }
}

export function fillPlaneParams (infos: SequenceAnimationInfo[]) {
    for (let i = 0; i < infos.length; ++i) {
        fillParams(planeAnimInfoMap[i], infos[i]);
    }
}
