
import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SceneChange')
export class SceneChange extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    @property(Node)
    target: Node;

    start () {
        // [3]
        this.target.active = false;
    }

    startGame () {
        // director.loadScene('level01');
        this.target.active = true;
        this.scheduleOnce(function() {
            // 这里的 this 指向 component
            // this.doSomething();
            director.loadScene('level01');
        }, 9);
    }

    backToMeun () {
        director.loadScene('start');
    }



    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
