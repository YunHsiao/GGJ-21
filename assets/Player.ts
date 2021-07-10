// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    @property
    climpSpeed = 3;

    _verticalDir = 0;
    _rigidBody: cc.RigidBody = null;
    _position = cc.v3();

    start () {
        this._rigidBody = this.node.getComponent(cc.RigidBody);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (e: cc.Event.EventKeyboard) => {
            if (e.keyCode === cc.macro.KEY.w) this._verticalDir = 1;
            else if (e.keyCode === cc.macro.KEY.s) this._verticalDir = -1;
        });
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, (e: cc.Event.EventKeyboard) => {
            if (e.keyCode === cc.macro.KEY.w) { if (this._verticalDir === 1) this._verticalDir = 0; }
            else if (e.keyCode === cc.macro.KEY.s) { if (this._verticalDir === -1) this._verticalDir = 0; }
            else if (e.keyCode === cc.macro.KEY.space) { this._rigidBody.applyForceToCenter(cc.v2(0, 100), true); }
        });
    }

    update (dt: number) {
        // this.node.setPosition(
        //     this.node.position.x,
        //     this.node.position.y + this._verticalDir * this.climpSpeed,
        //     this.node.position.x);
    }
}
