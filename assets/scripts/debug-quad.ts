import { _decorator } from 'cc';
import { ResizeAxis, UnlitQuadComponent } from './unlit-quad';
const { ccclass, property } = _decorator;

const ENABLE_DEBUG = true;

@ccclass('DebugQuad')
export class DebugQuad extends UnlitQuadComponent {

    @property
    public _autoResizeAxis = ResizeAxis.NONE;

    public onLoad () {
        if (!ENABLE_DEBUG) this.enabled = false;
        else super.onLoad();
    }
}
