 import { findSckSetting } from "../setting/shortcutkey";
 import { IO_TYPE, PRESS_TYPE } from "../util/const";

 class ViewportController {

     // var _this=this;
     curKeyCodes;

     curPointer;

     actEvent = null;

     pointerCache = [];
     pointerUser = "hand";
     targetDom;
     _camera;
     _scene;

     constructor(dom, scene, camera) {
         this.targetDom = dom;
         this._camera = camera;
         this._scene = scene;
         var that = this;
         this.curKeyCodes = new PriSet(( ioType, pressType, val, event) => {
                 that.checkEventLify(ioType, pressType, val, event)
             },
             ( ioType, pressType, val, event) => {
                 that.checkEventLify(ioType, pressType, val, event)
             });

         this.curPointer = new Proxy({}, {
             set(target, key, val) {
                 // console.log("set",val)
                 return target[key] = val
             },
             deleteProperty(target, key) {
                 // console.log("delete",key)
                 return delete target[key];
             }
         });
         document.addEventListener("keydown", function(event) {
             // console.log("keydown222", event.code)
             let _keyval = getSimpleKey(event.code);
             that.curKeyCodes.add(_keyval, [IO_TYPE.KEYBOARD, PRESS_TYPE.DOWN, _keyval, event])



         })
         document.addEventListener("keyup", function(event) {

             let _keyval = getSimpleKey(event.code);
             that.curKeyCodes.delete(_keyval, [IO_TYPE.KEYBOARD, PRESS_TYPE.UP, _keyval, event])
             // that.checkEventLify(IO_TYPE.KEYBOARD,  PRESS_TYPE.UP, _keyval, event)
             event.preventDefault()

         })

         dom.addEventListener('pointerdown', function() {
             if (event.pointerType === 'touch') {

             } else {
                 let ptype = getPointerType(event.button);
                 if (ptype) {
                     that.curPointer[ptype] = [IO_TYPE.MOUSE, PRESS_TYPE.DOWN, ptype, event];
                     that.checkEventLify(IO_TYPE.MOUSE, PRESS_TYPE.DOWN, ptype, event)
                 }

             }

         })

         dom.addEventListener('pointerup', function() {
             let ptype = getPointerType(event.button);
             if (ptype) {
                 console.log("pointerup")
                 delete that.curPointer[ptype];

                 that.checkEventLify(IO_TYPE.MOUSE, PRESS_TYPE.UP, ptype, event)
             }


         })
         dom.addEventListener('pointermove', function(evt) {

             if (that.actEvent) {
                 that.actEvent.onPointerMove(evt);
             }
         })
         dom.addEventListener('pointerout', function(evt) {

             if (that.actEvent) {
                 that.actEvent.close();
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
         if (this.actEvent != null && this.actEvent.isActive) {
             if (this.actEvent.curSteps > -1 && this.actEvent.curSteps < this.actEvent.steps.length) {

                 this.actEvent.onIOChange(ioType, pressType, val, event)
             } else {
                 console.log("结束" + pressType, val)
                 this.actEvent.close();
                 this.actEvent = null;
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
              
             var sckSetting = findSckSetting([...this.curKeyCodes], Object.keys(this.curPointer), this._scene, this._camera, this.targetDom);

             // console.log(sckSetting)
             if (sckSetting) {
                 // console.log("sckSetting", sckSetting)
                 this.actEvent = sckSetting[Symbol.for("event")];
                 if (this.actEvent) {
                     console.log("checkEventLify sart")
                     this.actEvent.start([...this.curKeyCodes], this.curPointer, event);
                     // this.actEvent.onIOChange(ioType, pressType, val, event)
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
     add(key, params) {
         if (!this.has(key)) {
             super.add(key)
             this.addCallback && this.addCallback.apply(this,  params)

         }

     }
     delete(key, params) {
         if (this.has(key)) {
             super.delete(key)
             this.delCallback && this.delCallback.call(this,   params)
         }

     }
 }




 export { ViewportController };