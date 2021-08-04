
import {OperEvent} from "./operevent"
import { IO_TYPE, PRESS_TYPE } from "../util/const";

class SceneTransEvent extends OperEvent{

	constructor(){
		super();
        this.steps=[ {
        	ioType:IO_TYPE.MOUSE,
        	pressType:PRESS_TYPE.UP
        }]
	}
    
    start(keys,pointers){
        this.isActive=true;
    }



	onPointerEffect(ioType, pressType, val, event){
        

        let _step = this.steps[this.curStep];
        if(this.isActive&&_step){
        	if((!_step.ioType||_step.ioType== ioType)&&(!_step.pressType||_step.pressType== pressType)&&(!_step.val||_step.val==val)&&this.curStep<this.steps.length-1){
                this.curStep++;
                return {done:false}
        	}
        }
        return {done:true}
	}
	onPointerMove(ioType, pressType, val, event){
		if(this.isActive){
			
		}
	}

	close(){
      this.isActive=false;
      this.curStep=0;
	}

}

export {
	SceneTransEvent
}