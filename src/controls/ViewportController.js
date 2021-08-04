 


import { findSckSetting } from "../setting/shortcutkey";
import { IO_TYPE, PRESS_TYPE } from "../util/const";

class ViewportController {

    curKeyCodes = new PriSet((val) => {
            // console.log("add new", val)
        },
        (val) => {
            // console.log("delete val", val)
        });

    curPointer = new Proxy({}, {
        set(target, key, val) {
            // console.log("set",val)
            return target[key] = val
        },
        deleteProperty(target, key) {
            // console.log("delete",key)
            return delete target[key];
        }
    });

    actEvent = null;

    pointerCache = [];
    pointerUser = "hand";

    constructor(dom, camera, scene) {

        var that = this;
        document.addEventListener("keydown", function(event) {
            // console.log("keydown222", event.code)
            let _keyval = getSimpleKey(event.code);
            that.curKeyCodes.add(_keyval)

            that.checkEventLify(IO_TYPE.KEYBOARD, PRESS_TYPE.DOWN, _keyval, event)

        })
        document.addEventListener("keyup", function(event) {

            let _keyval = getSimpleKey(event.code);
            that.curKeyCodes.delete(_keyval)
            that.checkEventLify(IO_TYPE.KEYBOARD,  PRESS_TYPE.UP, _keyval, event)
            event.preventDefault()

        })

        dom.addEventListener('pointerdown', function() {
            if (event.pointerType === 'touch') {

            } else {
                let ptype = getPointerType(event.button);
                if (ptype) {
                    that.curPointer[ptype] = event;
                    that.checkEventLify(IO_TYPE.MOUSE,  PRESS_TYPE.DOWN, ptype, event)
                }

            }

        })

        dom.addEventListener('pointerup', function() {
            let ptype = getPointerType(event.button);
            if (ptype) {
                delete that.curPointer[ptype];

                that.checkEventLify(IO_TYPE.MOUSE,  PRESS_TYPE.UP, ptype, event)
            }


        })
        dom.addEventListener('pointermove', function(evt) {
              if(this.actEvent){
                  this.actEvent.onPointerMove(evt);
              }
        })

        // Object.defineProperty(this,"curKeyCodes",{
        //  enumerable : true,
        //     configurable : true,
        //     set:function(newValue){
        //      console.log(newValue)
        //     }
        // })
    }

    checkEventLify(ioType, pressType, val, event) {
        if (this.actEvent != null) {
            if (this.actEvent.curSteps > 0 && this.actEvent.curSteps < this.actEvent.steps.length) {

            } else {
                //结束
            }
        } else {
            var hasPointer = Object.keys(this.curPointer).length > 0;
            var hasKeyDown = this.curKeyCodes.size > 0;
            if (!hasPointer && !hasKeyDown) {
                return;
            }
            /* var _key= [...this.curKeyCodes].sort().join("_");
              
              
             if(Object.keys(this.curPointer ).length>0){
                 for(let k in this.curPointer){
                     _key+="_"+this.curPointer[k]
                 }
             }*/
            var sckSetting = findSckSetting([...this.curKeyCodes], Object.keys(this.curPointer));
            console.log(this.curKeyCodes)
            console.log(this.curPointer)
            console.log(sckSetting)
            if (sckSetting) {
                console.log("sckSetting", sckSetting)
                this.actEvent = sckSetting[Symbol.for("event")];
                if (this.actEvent) {
                    this.actEvent.start();
                }
            }
        }
    }

    reset() {

    }

    setPointerUser(userName) {
        this.pointerUser = userName;
        this.reset();
    }
}

function getSimpleKey(oriKey) {
    if (oriKey.indexOf("Control") > -1) {
        return "Ctrl"
    }
    if (oriKey.indexOf("Shift") > -1) {
        return "Shift"
    }
    if (oriKey.indexOf("Key") == 0) {
        return oriKey.substr(3, 1)
    }
    return oriKey;
}

function getPointerType(val) {
    if (val == 0) {
        return "left"
    } else if (val == 1) {
        return "mid"
    } else if (val == 2) {
        return "right"
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




export { ViewportController };