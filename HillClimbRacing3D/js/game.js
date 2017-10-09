var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
    renderer, container;

var topLight, backLight;

var keycode = 0;

var clock = new THREE.Clock();
clock.start();
var delta;
var elapsedStop;

function createScene() {
    // Get the width and the height of the screen,
    // use them to set up the aspect ratio of the camera
    // and the size of the renderer.
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    // Create the scene
    scene = new THREE.Scene();

    //scene.fog = new THREE.Fog(0x607D8B, 2, 100);

    // Create the camera
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 45;
    nearPlane = 0.1;
    farPlane = 1000;
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );

    // Set the position of the camera
    camera.position.x = 0;
    camera.position.y = 1;
    camera.position.z= 20;
    camera.rotation.x = 0;


    // Create the renderer
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});

    // Define the size of the renderer; in this case,
    // it will fill the entire screen
    renderer.setSize(WIDTH, HEIGHT);

    // Enable shadow rendering
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add the DOM element of the renderer to the
    // container we created in the HTML
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    // Listen to the screen: if the user resizes it
    // we have to update the camera and the renderer size
    window.addEventListener('resize', handleWindowResize, false);

    scene.add(camera);
}

function createLights() {
    topLight = new THREE.PointLight(0xffffff, 3, 40, 2);
    topLight.position.set(8, 15 , 10);
    topLight.shadowCameraVisible = true;
    scene.add(topLight);

    backLight = new THREE.PointLight(0xffffff, 2, 8);
    backLight.position.set(-1.5 , 4 , -1.5);
    backLight.shadowCameraVisible = true;
    scene.add(backLight);


    backLight.shadowCameraFar = 1000;
    backLight.shadowCameraNear = 0.5;

    topLight.castShadow = true;
    topLight.shadow.mapSize.width = 2048;  // default
    topLight.shadow.mapSize.height = 1024; // default
    topLight.shadowCameraNear = 0.5;       // default
    topLight.shadowCameraFar= 1000;     // default
}

function createPlatform(){
    var randomPoints = [];

    for ( var i = 0; i < 20; i ++ ) {
        var segPos = -i + 10;
        randomPoints.unshift( new THREE.Vector3( segPos, THREE.Math.randFloat( -.25, .5 ), 0 ) );
        console.log("hoi" + i);
    }

    var randomSpline =  new THREE.SplineCurve3( randomPoints );

    var extrudeSettings = {
        steps			: 300,
        bevelEnabled	: false,
        extrudePath		: randomSpline
    };

    var pts = [];
    var rw = 2.5, rh = 0.1;
    pts.push( new THREE.Vector2(-rw * .5, 0) );
    pts.push( new THREE.Vector2(-rw * .5, rh) );
    pts.push( new THREE.Vector2(rw * .5, rh) );
    pts.push( new THREE.Vector2(rw * .5, 0) );

    var shape = new THREE.Shape( pts );

    var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

    var material2 = new THREE.MeshLambertMaterial( { color: 0x0000ff, wireframe: false, shading: THREE.SmoothShading } );

    var mesh = new THREE.Mesh( geometry, material2 );
    scene.add(mesh);

// Create the final object to add to the scene
    //platform.position.y = lastY + ((Math.random() - 0.50) / speed) + (upDown * speed / 10);
}

function pause(){
    if((elapsedStop + 0.5) < clock.getElapsedTime()) {
        if (stop == false) {
            stop = true;
            elapsedStop = clock.getElapsedTime();
        }
        else {
            stop = false;
            elapsedStop = clock.getElapsedTime();
        }
    }
}

function handleWindowResize() {
    // update height and width of the renderer and the camera
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

function loop(){
    // render the scene
    renderer.render(scene, camera);

    delta = clock.getDelta();
    //amera.lookAt(mesh);
    // call the loop function again
    requestAnimationFrame(loop);
}

window.addEventListener('load', init, false);

function init() {
    // set up the scene, the camera and the renderer
    createScene();

    createPlatform();

    // add the lights
    createLights();

    loop();
}