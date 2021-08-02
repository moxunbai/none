
var IO_TYPE_KEY=1;
var IO_TYPE_MOU=2;

import {findSckSetting} from "../setting/shortcutkey";

class ViewportController {

    curKeyCodes = new PriSet((val) => {
            // console.log("add new", val)
        },
        (val) => {
            // console.log("delete val", val)
        });

    curPointer=new Proxy({},{
    	set(target,key,val){
    		// console.log("set",val)
            return target[key]=val
    	},
    	deleteProperty(target,key){
    		// console.log("delete",key)
            return delete target[key];
    	}
    }); 

    actEvent=null;

    pointerCache=[];

    constructor(dom, camera, scene) {

        var that = this;
        document.addEventListener("keydown", function(event) {
            // console.log("keydown222", event.code)
             
            that.curKeyCodes.add(event.code)

            that.checkEventLify(IO_TYPE_KEY,"keydown",event)

        })
        document.addEventListener("keyup", function(event) {

            that.curKeyCodes.delete(event.code)
            that.checkEventLify(IO_TYPE_KEY,"keyup",event)
            event.preventDefault()
            
        })

        dom.addEventListener('pointerdown', function() {
            if (event.pointerType === 'touch') {

            } else {
                that.curPointer[event.button]=event;
            }
            that.checkEventLify(IO_TYPE_MOU,"pointerdown",event)
        })

        dom.addEventListener('pointerup', function() {
              delete that.curPointer[event.button] ;
              that.checkEventLify(IO_TYPE_MOU,"pointerup",event)
        })
        dom.addEventListener('pointermove', function() {

        })

        // Object.defineProperty(this,"curKeyCodes",{
        // 	enumerable : true,
        //     configurable : true,
        //     set:function(newValue){
        //     	console.log(newValue)
        //     }
        // })
    }

    checkEventLify(ioType,triggerName,event) {
         if(this.actEvent!=null){
         	if(actEvent.curSteps>0&&actEvent.curSteps<actEvent.steps.length){

         	}else{
         		//结束
         	}
         }else{
            var _key ="";
            var _key= [...this.curKeyCodes].sort().join("_");
            console.log(_key)
             
            if(Object.keys(this.curPointer ).length>0){
                for(let k in this.curPointer){
                    _key+="_"+this.curPointer[k]
                }
            }
         	var sckSetting = findSckSetting(_key);
            console.log(_key,sckSetting)
            if(sckSetting){
                console.log("sckSetting",sckSetting)
                this.actEvent = sckSetting.event;
            }
         }
    }

    setTask(task){

    }
}

class PriSet extends Set {

    addCallback = null;
    delCallback = null;
    constructor(addCallback, delCallback, ...args) {
        super(args);
        this.addCallback = addCallback;
        this.delCallback = delCallback;

    }
    add(val) {
        if (!this.has(val)) {
            super.add(val)
            this.addCallback && this.addCallback.call(this, val)

        }

    }
    delete(val) {
        if (this.has(val)) {
            super.delete(val)
            this.delCallback && this.delCallback.call(this, val)
        }

    }
}

 


 export {ViewportController};