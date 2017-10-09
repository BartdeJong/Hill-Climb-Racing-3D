var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
    renderer, container;

var topLight, backLight;

var keycode = 0;

var clock = new THREE.Clock();
clock.start();
var platformDelta = 0;
var platformDelta2 = 0;
var delta;
var elapsedStop;
var elapsedSpeed = 0;
var lastBlock = 0;

var carSpeed = 10;


var lastY = 5;
var platformList = [];
var upDown = 0;

var wheel1, wheel2, wheel3, wheel4;

function createScene() {
    // Get the width and the height of the screen,
    // use them to set up the aspect ratio of the camera
    // and the size of the renderer.
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    // Create the scene
    scene = new THREE.Scene();

    scene.fog = new THREE.Fog(0x607D8B, 2, 100);

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
    camera.position.x = -5;
    camera.position.y = 4;
    camera.position.z= 10;
    camera.rotation.x = -0.3;


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

function createWheels(){
    var geometryWheel = new THREE.SphereGeometry(0.15);
    var materialWheel = new THREE.MeshPhongMaterial({color: 0x0000ff, side:THREE.DoubleSide});
    wheel1 = new THREE.Mesh(geometryWheel, materialWheel);
    wheel1.receiveShadow = true;
    wheel1.castShadow = true;
    wheel1.position.x = -5;
    wheel1.position.z = -0.25;
    wheel1.position.y = 10;
    scene.add(wheel1);

    wheel2 = new THREE.Mesh(geometryWheel, materialWheel);
    wheel2.receiveShadow = true;
    wheel2.castShadow = true;
    wheel2.position.x = -5;
    wheel2.position.z = 0.25;
    wheel2.position.y = 10;
    scene.add(wheel2);

    wheel3 = new THREE.Mesh(geometryWheel, materialWheel);
    wheel3.receiveShadow = true;
    wheel3.castShadow = true;
    wheel3.position.x = -6;
    wheel3.position.z = -0.25;
    wheel3.position.y = 10;
    scene.add(wheel3);

    wheel4 = new THREE.Mesh(geometryWheel, materialWheel);
    wheel4.receiveShadow = true;
    wheel4.castShadow = true;
    wheel4.position.x = -6;
    wheel4.position.z = 0.25;
    wheel4.position.y = 10;
    scene.add(wheel4);
}

function createPlatform(speed){
    if(platformDelta > (1 / carSpeed)){
        //alert("createPlatform");
        if(platformDelta2 > (2.5 / carSpeed * 10)){
            upDown = (Math.random() - 0.5) / 10;
            platformDelta2 = 0;
        }
        var geometryPlatform = new THREE.BoxGeometry((1 / speed * 1.1), 10, 1.5);
        var materialPlatform = new THREE.MeshPhongMaterial({color: 0x331a00, side:THREE.DoubleSide});
        var platform = new THREE.Mesh(geometryPlatform, materialPlatform);
        platform.receiveShadow = true;
        platform.castShadow = true;
        platform.position.y = lastY + ((Math.random() - 0.50) / speed) + (upDown * speed / 10);
        lastY = platform.position.y;
        platform.position.x = 5;
        platformList.push(platform);
        scene.add(platform);
        platformDelta = platformDelta - (1 / carSpeed);
    }
    movePlatform();
}

function movePlatform(){
    for(var i = 0; i < platformList.length; i++){
        platformList[i].position.x -= delta / 10 * carSpeed;
        if(platformList[i].position.x < -4.9 && platformList[i].position.x > -5.1){
            if(carSpeed > 0) {
                carSpeed += (wheel1.position.y - (platformList[i].position.y + 5.115)) * 30;
            }
            if(carSpeed < 0) {
                carSpeed += -(wheel1.position.y - (platformList[i].position.y + 5.115)) * 30;
            }
            wheel1.position.y = platformList[i].position.y + 5.115;
            wheel2.position.y = platformList[i].position.y + 5.115;
            //alert(platformList[i].position.z);
        }
        if(platformList[i].position.x < -5.9 && platformList[i].position.x > -6.1){
            wheel3.position.y = platformList[i].position.y + 5.115;
            wheel4.position.y = platformList[i].position.y + 5.115;
            //alert(platformList[i].position.z);
        }
        if(platformList[i].position.x < -15){
            if (i > -1) {
                scene.remove(platformList[i]);
                platformList.splice(i, 1);
            }
        }
    }
}

function moveCameraUp(){
    var cameraY = 0;
    for(var i = 0; i < platformList.length; i++){
        cameraY += platformList[i].position.y;
    }
    camera.position.y = wheel1.position.y + 6;
    topLight.position.y = (cameraY / platformList.length) + 15;
    backLight.position.y = (cameraY / platformList.length) + 4;
}

function changeSpeed(){
    document.addEventListener("keydown", onDocumentKeyDown);
    function onDocumentKeyDown(event) {
        keycode = event.which;
        if(keycode == 39 && elapsedSpeed < 0){
            carSpeed += 1;
            elapsedSpeed = 0.1;
        }
        if(keycode == 37 && elapsedSpeed < 0){
            carSpeed -= 1;
            elapsedSpeed = 0.1;
        }
    }
    if(carSpeed > 10) {
        carSpeed = carSpeed * 0.985;
    }
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
    platformDelta += delta;
    platformDelta2 += delta;
    elapsedSpeed -= delta;
    createPlatform(10);
    moveCameraUp();
    changeSpeed();

    // call the loop function again
    requestAnimationFrame(loop);
}

window.addEventListener('load', init, false);

function init() {
    // set up the scene, the camera and the renderer
    createScene();

    // add the lights
    createLights();
    createWheels();
    // add the objects
    //camera.lookAt();
    // start a loop that will update the objects' positions
    // and render the scene on each frame
    loop();
}