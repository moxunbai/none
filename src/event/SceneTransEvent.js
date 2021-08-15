var THREE = require("three")
import { OperEvent } from "./operevent"
import { IO_TYPE, PRESS_TYPE } from "../util/const";

const EPS = 0.000001;
class SceneTransEvent extends OperEvent {

    _scene;
    _camera;
    _dom;
    
    rotateSpeed = 1.0;
 


    target = new THREE.Vector3();
    EPS = 0.000001;
    lastPosition = new THREE.Vector3();
    dynamicDampingFactor = 0.2;
    lastZoom = 1;
    // _state = STATE.NONE;
    // _keyState = STATE.NONE;
    _touchZoomDistanceStart = 0;
    _touchZoomDistanceEnd = 0;
    _lastAngle = 0;

    _eye = new THREE.Vector3();
    _movePrev = new THREE.Vector2();
    _moveCurr = new THREE.Vector2();
    _lastAxis = new THREE.Vector3();
    _zoomStart = new THREE.Vector2();
    _zoomEnd = new THREE.Vector2();
    _panStart = new THREE.Vector2();
    _panEnd = new THREE.Vector2();
    _pointers = [];
    _pointerPositions = {}; // for reset

    rotateCamera;
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
        this.rotateCamera = function() {
            const axis = new THREE.Vector3(),
                quaternion = new THREE.Quaternion(),
                eyeDirection = new THREE.Vector3(),
                objectUpDirection = new THREE.Vector3(),
                objectSidewaysDirection = new THREE.Vector3(),
                moveDirection = new THREE.Vector3();

            return function rotateCamera() {

                moveDirection.set(that._moveCurr.x - that._movePrev.x, that._moveCurr.y - that._movePrev.y, 0);

                let angle = moveDirection.length();

                // console.log("rotateCamera length:" + angle, moveDirection)
                if (angle) {

                    that._eye.copy(that._camera.position).sub(that.target);

                    eyeDirection.copy(that._eye).normalize();
                    objectUpDirection.copy(that._camera.up).normalize();
                    objectSidewaysDirection.crossVectors(objectUpDirection, eyeDirection).normalize();
                    objectUpDirection.setLength(that._moveCurr.y - that._movePrev.y);
                    objectSidewaysDirection.setLength(that._moveCurr.x - that._movePrev.x);
                    moveDirection.copy(objectUpDirection.add(objectSidewaysDirection));
                    axis.crossVectors(moveDirection, that._eye).normalize();
                    angle *= that.rotateSpeed;
                    quaternion.setFromAxisAngle(axis, angle);

                    that._eye.applyQuaternion(quaternion);

                    that._camera.up.applyQuaternion(quaternion);

                    that._lastAxis.copy(axis);

                    that._lastAngle = angle;
                    // return true

                } else if (!that.staticMoving && that._lastAngle) {

                    that._lastAngle *= Math.sqrt(1.0 - that.dynamicDampingFactor);

                    that._eye.copy(that._camera.position).sub(that.target);

                    quaternion.setFromAxisAngle(that._lastAxis, that._lastAngle);

                    that._eye.applyQuaternion(quaternion);

                    that._camera.up.applyQuaternion(quaternion);
                     
                }

                that._movePrev.copy(that._moveCurr);

            };
        }()

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
            this._moveCurr.copy(getMouseOnCircle(pointerEvt.pageX, pointerEvt.pageY, this.screen));

            this._movePrev.copy(this._moveCurr);
             
            this.onIOChange.apply(this, params)
        }
    }



    onIOChange(ioType, pressType, val, event) {

        // if(ioType==IO_TYPE.KEYBOARD){
        //     return
        // }

        // var a = ioType == IO_TYPE.KEYBOARD ? "键盘" : "鼠标";
        // a += "==" + ioType
        // var aa = pressType == PRESS_TYPE.DOWN ? "Down" : "up"
        let _step = this.steps[this.curSteps];
        // var qq = matchStep(_step, this.curSteps, ioType, pressType, val, event)
        // console.log(this.curSteps + "  " + a + aa + "  " + val + "onPointerEffect isact:" + this.isActive + "  qq " + qq, _step)

        if (this.isActive && _step) {
            // console.log("onPointerEffect act", 112)
            if (matchStep(_step, this.curSteps, ioType, pressType, val, event)) {
                // console.log("onPointerEffect matchStep", pressType)
                // if (this.curSteps == 0) {
                //     this.dollyStart.x = event.clientX
                //     this.dollyStart.y = event.clientY
                // }
                this.curSteps++;
                if (this.curSteps < this.steps.length) {
                    return { done: false }
                } else {
                    console.log("onPointerEffect close", 1)
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
 
            this._movePrev.copy(this._moveCurr);

            this._moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY, this.screen));
            this.update();
        }
    }


    rotateLeft(angle) {

        this.sphericalDelta.theta -= angle;

    }

    rotateUp(angle) {

        this.sphericalDelta.phi -= angle;

    }



    update() {

        

        var that = this;

        that._eye.subVectors( that._camera.position, that.target );
        this.rotateCamera();
        that._camera.position.addVectors(that.target, that._eye);

        if (that._camera.isPerspectiveCamera) {

            // that.checkDistances();
            that._camera.lookAt(that.target);
 
            if (that.lastPosition.distanceToSquared(that._camera.position) > EPS) {

                // that.dispatchEvent(_changeEvent);
                that.lastPosition.copy(that._camera.position);

            }

        } else if (that._camera.isOrthographicCamera) {

            that._camera.lookAt(that.target);

            if (that.lastPosition.distanceToSquared(that._camera.position) > EPS || lastZoom !== that._camera.zoom) {

                // that.dispatchEvent(_changeEvent);
                lastPosition.copy(that._camera.position);
                lastZoom = that._camera.zoom;

            }

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
    SceneTransEvent
}