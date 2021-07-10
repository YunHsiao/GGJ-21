import { ccenum } from 'cc';
import { fillParams, ISequenceAnimationInfo, PlaybackMode, SequenceAnimationInfo } from './sequence-animation';

const GLIDING_PREP_TIME = 0.5;

export enum CharacterStates {
    RUNNING,
    JUMPING,
    SLIDING,
    SLIDING_LOOP,
    GLIDING,
    GLIDING_LOOP,
}
ccenum(CharacterStates);

const characterAnimInfoMap: Record<CharacterStates, ISequenceAnimationInfo> = {
    [CharacterStates.RUNNING]: {
        width: 4, height: 3, frames: 11,
        mode: PlaybackMode.GLOBAL_LOOP,
        duration: 1,
    },
    [CharacterStates.JUMPING]: {
        width: 4, height: 2,
        mode: PlaybackMode.LOCAL_ONCE,
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
        duration: GLIDING_PREP_TIME,
        nextState: CharacterStates.GLIDING_LOOP,
    },
    [CharacterStates.GLIDING_LOOP]: {
        width: 5, height: 4, frames: 19,
        mode: PlaybackMode.LOCAL_LOOP,
        duration: 2,
    },
};

export enum PlaneStates {
    HIDDEN,
    GLIDING_START,
    GLIDING_END,
}
ccenum(PlaneStates);

const planeAnimInfoMap: Record<PlaneStates, ISequenceAnimationInfo> = {
    [PlaneStates.HIDDEN]: {
        width: 3, height: 6,
        mode: PlaybackMode.LOCAL_ONCE,
        startFrom: 1,
        duration: 0,
    },
    [PlaneStates.GLIDING_START]: {
        width: 3, height: 6,
        mode: PlaybackMode.LOCAL_ONCE,
        startFrom: 1,
        duration: -GLIDING_PREP_TIME,
    },
    [PlaneStates.GLIDING_END]: {
        width: 3, height: 6,
        mode: PlaybackMode.LOCAL_ONCE,
        duration: GLIDING_PREP_TIME,
    },
};

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
