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

@ccclass('SequenceAnimationInfo')
export class SequenceAnimationInfo {
    @property(Texture2D)
    texture: Texture2D = null;

    params = new Vec4(4.1, 4, 0, 0);
    playbackSpeed = 1;
    nextState = -1;
}

enum PlaybackMode {
    LOCAL_LOOP,
    LOCAL_ONCE,
    GLOBAL_LOOP,
}

interface IAnimationInfo {
    width: number;
    height: number;
    frames: number;
    mode: PlaybackMode;
    progress: number;
    playbackSpeed: number;
    nextState: number;
}

const characterAnimInfoMap: Record<CharacterStates, IAnimationInfo> = {
    [CharacterStates.RUNNING]: {
        width: 4, height: 1, frames: 4,
        mode: PlaybackMode.GLOBAL_LOOP, progress: 0,
        playbackSpeed: 1,
        nextState: -1,
    },
    [CharacterStates.JUMPING]: {
        width: 4, height: 1, frames: 4,
        mode: PlaybackMode.GLOBAL_LOOP, progress: 0,
        playbackSpeed: 1,
        nextState: -1,
    },
    [CharacterStates.SLIDING]: {
        width: 5, height: 1, frames: 5,
        mode: PlaybackMode.LOCAL_ONCE, progress: 0,
        playbackSpeed: 1,
        nextState: 3,
    },
    [CharacterStates.SLIDING_LOOP]: {
        width: 2, height: 1, frames: 2,
        mode: PlaybackMode.LOCAL_LOOP, progress: 0,
        playbackSpeed: 1,
        nextState: -1,
    },
    [CharacterStates.GLIDING]: {
        width: 2, height: 2, frames: 4,
        mode: PlaybackMode.LOCAL_ONCE, progress: 0,
        playbackSpeed: 2,
        nextState: 5,
    },
    [CharacterStates.GLIDING_LOOP]: {
        width: 5, height: 4, frames: 19,
        mode: PlaybackMode.LOCAL_LOOP, progress: 0,
        playbackSpeed: 2,
        nextState: -1,
    },
};

const planeAnimInfoMap: Record<PlaneStates, IAnimationInfo> = {
    [PlaneStates.HIDDEN]: {
        width: 3, height: 6, frames: 18,
        mode: PlaybackMode.LOCAL_ONCE, progress: 18,
        playbackSpeed: 0,
        nextState: -1,
    },
    [PlaneStates.GLIDING_START]: {
        width: 3, height: 6, frames: 18,
        mode: PlaybackMode.LOCAL_ONCE, progress: 18,
        playbackSpeed: -4,
        nextState: -1,
    },
    [PlaneStates.GLIDING_END]: {
        width: 3, height: 6, frames: 18,
        mode: PlaybackMode.LOCAL_ONCE, progress: 0,
        playbackSpeed: 4,
        nextState: -1,
    },
};

function fillParams (src: IAnimationInfo, dst: SequenceAnimationInfo) {
    dst.params.x = src.width + src.height * 0.1;
    dst.params.y = src.frames;
    dst.params.z = src.mode;
    dst.params.w = src.mode === PlaybackMode.GLOBAL_LOOP ? src.playbackSpeed : src.progress;
    dst.playbackSpeed = src.mode === PlaybackMode.GLOBAL_LOOP ? 0 : src.playbackSpeed;
    dst.nextState = src.nextState;
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
