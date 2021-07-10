import { _decorator } from 'cc';
import { UnlitQuadComponent } from './unlit-quad';
const { ccclass } = _decorator;

const ENABLE_DEBUG = true;

@ccclass('DebugQuad')
export class DebugQuad extends UnlitQuadComponent {

    public onLoad () {
        if (!ENABLE_DEBUG) this.enabled = false;
        else super.onLoad();
    }
}
