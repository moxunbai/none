var THREE = require("three")

import { WEBGL } from 'three/examples/jsm/WebGL.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ViewportController } from './controls/ViewportController';
 
if ( WEBGL.isWebGL2Available() === false ) {

	document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );
   
}else{
	console.log("use webgl 2")
}

var canvas = document.createElement( 'canvas' );
var context = canvas.getContext( 'webgl2', { alpha: false } );
var renderer = new THREE.WebGLRenderer( { canvas: canvas, context: context } );

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

camera.position.z = 5;

// var loader = new THREE.GLTFLoader();
/*var loader = new  GLTFLoader();
loader.load( './static/models/Duck/glTF/Duck.gltf', function ( gltf ) {

	scene.add( gltf.scene );
	console.log(111)
	// animate();

}, function(xhr){
	console.log(222)
	console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}, function ( error ) {

	console.error( error );

} );*/


function animate() {
    requestAnimationFrame(animate);
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

new ViewportController(document.getElementById("demo"));