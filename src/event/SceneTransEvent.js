var THREE = require("three")
import { OperEvent } from "./operevent"
import { IO_TYPE, PRESS_TYPE } from "../util/const";

const EPS = 0.000001;
class SceneTransEvent extends OperEvent {

    _scene;
    _camera;
    _dom;
    dollyStart = {};
    dollyEnd = {};
    dollyDelta = {};
    scale = 1;
    maxZoom = Infinity;
    minZoom = 0;
    zoomSpeed = 1.0; // Set to false to disable rotating
    target = new THREE.Vector3();
    rotateStart = new THREE.Vector2();
    rotateEnd = new THREE.Vector2();
    rotateDelta = new THREE.Vector2();
    rotateSpeed = 1.0;

    spherical = new THREE.Spherical();
    sphericalDelta = new THREE.Spherical();
    panOffset = new THREE.Vector3();

    minAzimuthAngle = -Infinity; // radians
    maxAzimuthAngle = Infinity; // radians

    minDistance = 0;
    maxDistance = Infinity; // How far you can zoom in and out ( OrthographicCamera only )

    minPolarAngle = 0; // radians

    maxPolarAngle = Math.PI; // radians

    enableDamping = false;
    dampingFactor = 0.05; // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming

    zoomChanged = false;

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
    }

    start(keys, pointers, event) {
        this.isActive = true;
        this.rotateStart.set(event.clientX, event.clientY);
        if(pointers){
            var opts = Object.values(pointers)
            this.onIOChange.apply(this,opts&&opts[0])
        }
    }



    onIOChange(ioType, pressType, val, event) {

        // if(ioType==IO_TYPE.KEYBOARD){
        //     return
        // }

         var a = ioType==IO_TYPE.KEYBOARD?"键盘":"鼠标";
         a+="=="+ioType
         var aa=pressType==PRESS_TYPE.DOWN?"Down":"up"
        let _step = this.steps[this.curSteps];
       var qq= matchStep(_step, this.curSteps,ioType, pressType, val, event)
console.log(this.curSteps+"  "+ a+aa+"  "+ val+"onPointerEffect isact:"+this.isActive+"  qq "+qq  ,_step)

        if (this.isActive && _step) {
            // console.log("onPointerEffect act", 112)
            if (matchStep(_step, this.curSteps,ioType, pressType, val, event)) {
                 console.log("onPointerEffect matchStep", pressType)
                if (this.curSteps == 0) {
                    this.dollyStart.x = event.clientX
                    this.dollyStart.y = event.clientY
                }
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
            console.log("onPointerMove", 222)


            this.rotateEnd.set(event.clientX, event.clientY);
            this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);
            const element = this._dom;
            this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight); // yes, height

            this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight);
            this.rotateStart.copy(this.rotateEnd);
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

        const offset = new THREE.Vector3(); // so camera.up is the orbit axis

        const quat = new THREE.Quaternion().setFromUnitVectors(this._camera.up, new THREE.Vector3(0, 1, 0));
        const quatInverse = quat.clone().invert();
        const lastPosition = new THREE.Vector3();
        const lastQuaternion = new THREE.Quaternion();
        const twoPI = 2 * Math.PI;
        var that = this;
        return function update() {

            const position = that._camera.position;
            offset.copy(position).sub(that.target); // rotate offset to "y-axis-is-up" space

            offset.applyQuaternion(quat); // angle from z-axis around y-axis

            that.spherical.setFromVector3(offset);

            if (that.autoRotate && that.state === STATE.NONE) {

                rotateLeft(getAutoRotationAngle());

            }

            // console.log(that.sphericalDelta)
            if (that.enableDamping) {

                that.spherical.theta += that.sphericalDelta.theta * that.dampingFactor;
                that.spherical.phi += that.sphericalDelta.phi * that.dampingFactor;

            } else {

                that.spherical.theta += that.sphericalDelta.theta;
                that.spherical.phi += that.sphericalDelta.phi;

            } // restrict theta to be between desired limits


            let min = that.minAzimuthAngle;
            let max = that.maxAzimuthAngle;

            if (isFinite(min) && isFinite(max)) {

                if (min < -Math.PI) min += twoPI;
                else if (min > Math.PI) min -= twoPI;
                if (max < -Math.PI) max += twoPI;
                else if (max > Math.PI) max -= twoPI;

                if (min <= max) {

                    that.spherical.theta = Math.max(min, Math.min(max, that.spherical.theta));

                } else {

                    that.spherical.theta = that.spherical.theta > (min + max) / 2 ? Math.max(min, that.spherical.theta) : Math.min(max, that.spherical.theta);

                }

            } // restrict phi to be between desired limits


            that.spherical.phi = Math.max(that.minPolarAngle, Math.min(that.maxPolarAngle, that.spherical.phi));
            that.spherical.makeSafe();
            that.spherical.radius *= that.scale; // restrict radius to be between desired limits

            that.spherical.radius = Math.max(that.minDistance, Math.min(that.maxDistance, that.spherical.radius)); // move target to panned location

            if (that.enableDamping === true) {

                that.target.addScaledVector(that.panOffset, that.dampingFactor);

            } else {

                that.target.add(that.panOffset);

            }

            offset.setFromSpherical(that.spherical); // rotate offset back to "camera-up-vector-is-up" space
            // console.log(offset)
            offset.applyQuaternion(quatInverse);
            position.copy(that.target).add(offset);
            that._camera.lookAt(that.target);

            /* if (that.enableDamping === true) {

                 that.sphericalDelta.theta *= 1 - that.dampingFactor;
                 that.sphericalDelta.phi *= 1 - that.dampingFactor;
                 that.panOffset.multiplyScalar(1 - that.dampingFactor);

             } else {

                 that.sphericalDelta.set(0, 0, 0);
                 that.panOffset.set(0, 0, 0);

             }

             that.scale = 1; // update condition is:
             // min(camera displacement, camera rotation in radians)^2 > EPS
             // using small-angle approximation cos(x/2) = 1 - x^2 / 8

             if (that.zoomChanged || lastPosition.distanceToSquared(that._camera.position) > EPS || 8 * (1 - lastQuaternion.dot(that._camera.quaternion)) > EPS) {

                 that.dispatchEvent(_changeEvent);
                 lastPosition.copy(that._camera.position);
                 lastQuaternion.copy(that._camera.quaternion);
                 that.zoomChanged = false;
                 return true;

             }*/

            return false;

        }();
    }

    close() {
        this.isActive = false;
        this.curStep = 0;
    }


    dollyOut(dollyScale, camera) {

        if (camera.isPerspectiveCamera) {

            this.scale /= dollyScale;

        } else if (camera.isOrthographicCamera) {

            camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, camera.zoom * dollyScale));
            camera.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;

        }

    }
    dollyIn(dollyScale, camera) {

        if (camera.isPerspectiveCamera) {

            this.scale *= dollyScale;

        } else if (camera.isOrthographicCamera) {

            camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, camera.zoom / dollyScale));
            camera.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;

        }

    }
}

function getZoomScale(zoomSpeed) {

    return Math.pow(0.95, zoomSpeed);

}

function matchStep(step, idx,ioType, pressType, val, event) {
    // console.log("in matchStep step.ioType == ioType ", step.ioType == ioType)   
    // console.log( "step.pressType == pressType ", step.pressType == pressType) 
    // console.log( "step.val == val ",step.val == val)
    if ((!step.ioType || step.ioType == ioType) && (!step.pressType || step.pressType == pressType) && (!step.val || step.val == val)) {
        return true
    }
    return false;
}

export {
    SceneTransEvent
}