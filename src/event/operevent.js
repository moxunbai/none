
class OperEvent{
	
	curSteps=0;
	steps=[{}];
	isActive=false;
	constructor(){
		 if (new.target === OperEvent) {
		 	throw new Error("OperEvent is abstract")
		 }
       
	}
 

	start(){
          
	}

	onPointerEffect(){

	}
	onPointerMove(){
		
	}

	close(){

	}
}


export {
	OperEvent
}