var THREE = require("three")
import { OperEvent } from "./operevent"
import { IO_TYPE, PRESS_TYPE } from "../util/const";

const EPS = 0.000001;
class ScenePanEvent extends OperEvent {

    _scene;
    _camera;
    _dom;
      
    panSpeed = 0.3;
    target = new THREE.Vector3();
    EPS = 0.000001;
    lastPosition = new THREE.Vector3();
    dynamicDampingFactor = 0.2;
    
    _touchZoomDistanceStart = 0;
    _touchZoomDistanceEnd = 0;
    _lastAngle = 0;

    _eye = new THREE.Vector3();
    _movePrev = new THREE.Vector2();
    _moveCurr = new THREE.Vector2();
    _lastAxis = new THREE.Vector3();
    
    _panStart = new THREE.Vector2();
    _panEnd = new THREE.Vector2();
    _pointers = [];
    _pointerPositions = {}; // for reset

    panCamera;
    handleResize;
    screen = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };

    constructor(option, scene, camera, dom) {
        super();
        this.steps = [{
            ioType: IO_TYPE.MOUSE,
            pressType: PRESS_TYPE.DOWN
        }, {
            ioType: IO_TYPE.MOUSE,
            pressType: PRESS_TYPE.UP
        }]
        this._scene = scene;
        this._camera = camera;
        this._dom = dom;
        var that = this;
        
        this.panCamera = function () {

            const mouseChange = new THREE.Vector2(),
                objectUp = new THREE.Vector3(),
                pan = new THREE.Vector3();
            return function panCamera() {

                mouseChange.copy( that._panEnd ).sub( that._panStart );
                // console.log("mouseChange.lengthSq()" ,mouseChange.lengthSq())
                if ( mouseChange.lengthSq() ) {

                    if ( that._camera.isOrthographicCamera ) {
                        console.log(" isOrthographicCamera" )
                        const scale_x = ( that._camera.right - that._camera.left ) / that._camera.zoom / that.screen.width;
                        const scale_y = ( that._camera.top -that._camera.bottom ) / that._camera.zoom / that.screen.width;
                        mouseChange.x *= scale_x;
                        mouseChange.y *= scale_y;

                    }

                    mouseChange.multiplyScalar( that._eye.length() * that.panSpeed );
                    pan.copy( that._eye ).cross( that._camera.up ).setLength( mouseChange.x );
                    pan.add( objectUp.copy( that._camera.up ).setLength( mouseChange.y ) );
                    that._camera.position.add( pan );
                    
                    that.target.add( pan );

                    if ( that.staticMoving ) {

                        that._panStart.copy( that._panEnd );

                    } else {

                        that._panStart.add( mouseChange.subVectors( that._panEnd, that._panStart ).multiplyScalar( that.dynamicDampingFactor ) );

                    }

                }

            };

        }();
        this.handleResize = function() {

            const box = dom.getBoundingClientRect(); // adjustments come from similar code in the jquery offset() function

            const d = dom.ownerDocument.documentElement;
            that.screen.left = box.left + window.pageXOffset - d.clientLeft;
            that.screen.top = box.top + window.pageYOffset - d.clientTop;
            that.screen.width = box.width;
            that.screen.height = box.height;

        };
        this.handleResize()
    }

    start(keys, pointers, event) {
        this.isActive = true;
        // this.rotateStart.set(event.clientX, event.clientY);


        if (pointers) {

            var opts = Object.values(pointers);
            let params = opts && opts[0];
            let pointerEvt = params[3];
            this._panStart.copy( getMouseOnScreen( pointerEvt.pageX, pointerEvt.pageY, this.screen ) );

            this._panEnd.copy( this._panStart );
            
            
             
            this.onIOChange.apply(this, params)
        }
    }



    onIOChange(ioType, pressType, val, event) {

         
        let _step = this.steps[this.curSteps];
       
        if (this.isActive && _step) {
            // console.log("onPointerEffect act", 112)
            if (matchStep(_step, this.curSteps, ioType, pressType, val, event)) {
                
                this.curSteps++;
                if (this.curSteps < this.steps.length) {
                    return { done: false }
                } else {
                    console.log("onPointerEffect close", 22)
                    this.close()
                }
            }

        }
        return { done: true }
    }
    onPointerMove(event) {
        // console.log("onPointerMove", 11)
        if (this.isActive) {
            // console.log("onPointerMove", 222)
 
            this._panEnd.copy( getMouseOnScreen( event.pageX, event.pageY , this.screen) );
 
            this.update();
        }
    }
 
    update() {
        console.log("ScenePanEvent update")
        var that = this;
        that._eye.subVectors( that._camera.position, that.target );
        this.panCamera();
        that._camera.position.addVectors(that.target, that._eye);
         
        if (that._camera.isPerspectiveCamera) {
            
            that._camera.lookAt(that.target);
  

        } else if (that._camera.isOrthographicCamera) {

            that._camera.lookAt(that.target);

             

        } else {

            console.warn('THREE.TrackballControls: Unsupported camera type');

        }

         
    }

    close() {
        this.isActive = false;
        this.curStep = 0;
    }



}

const getMouseOnCircle = function() {

    const vector = new THREE.Vector2();
    return function _getMouseOnCircle(pageX, pageY, screen) {
        // console.log("getMouseOnCircle   " + pageX, pageY)
        vector.set((pageX - screen.width * 0.5 - screen.left) / (screen.width * 0.5), (screen.height + 2 * (screen.top - pageY)) / screen.width // screen.width intentional
        );
        return vector;

    };

}();
const getMouseOnScreen = function () {

    const vector = new THREE.Vector2();
    return function getMouseOnScreen( pageX, pageY , screen) {

        vector.set( ( pageX - screen.left ) /  screen.width, ( pageY - screen.top ) / screen.height );
        return vector;

    };

}();

function getZoomScale(zoomSpeed) {

    return Math.pow(0.95, zoomSpeed);

}

function matchStep(step, idx, ioType, pressType, val, event) {
 
    if (step && (!step.ioType || step.ioType == ioType) && (!step.pressType || step.pressType == pressType) && (!step.val || step.val == val)) {
        return true
    }
    return false;
}

export {
    ScenePanEvent
}