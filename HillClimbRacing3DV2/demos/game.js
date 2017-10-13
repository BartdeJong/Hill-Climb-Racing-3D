var demo = new CANNON.Demo();
var mass = 150;
var vehicle;
var positieX = 0;
var positieZ = 0;
var last = 0;
var segments = 0;
var point = 0;
var automatic = false;
var removebaan = 0;
var removebaanarray = [];
var endpoint = 0;

var presetArray1 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

demo.addScene("car",function(){
    var world = demo.getWorld();
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.gravity.set(0, 0, -10);
    world.defaultContactMaterial.friction = 0.005;

    var groundMaterial = new CANNON.Material("groundMaterial");
    var wheelMaterial = new CANNON.Material("wheelMaterial");
    var wheelGroundContactMaterial = window.wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
        friction: 0.3,
        restitution: 0,
        contactEquationStiffness: 1000
    });

    // We must add the contact materials to the world
    world.addContactMaterial(wheelGroundContactMaterial);

    var chassisShape;
    chassisShape = new CANNON.Box(new CANNON.Vec3(2, 1,0.5));
    var chassisBody = new CANNON.Body({ mass: mass });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(-10, 0, 24);
    chassisBody.angularVelocity.set(0, 0, 0.5);
    demo.addVisual(chassisBody);

    var options = {
        radius: 0.5,
        directionLocal: new CANNON.Vec3(0, 0, -1),
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 5,
        dampingRelaxation: 10,
        dampingCompression: 2,
        maxSuspensionForce: 100000,
        rollInfluence:  0.01,
        axleLocal: new CANNON.Vec3(0, 1, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
        maxSuspensionTravel: 0.3,
        customSlidingRotationalSpeed: -30,
        useCustomSlidingRotationalSpeed: true
    };

    // Create the vehicle
    vehicle = new CANNON.RaycastVehicle({
        chassisBody: chassisBody,
    });

    wallShape = new CANNON.Box(new CANNON.Vec3(2, 1,0.5));
    var wallBody = new CANNON.Body({ mass: 1000 });
    wallBody.addShape(wallShape);
    wallBody.position.set(endpoint, chassisBody.position.y, chassisBody.position.z);
    world.add(wallBody);
    // demo.addVisual(wallBody);


    options.chassisConnectionPointLocal.set(1.6, 1, -0.3);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(1.6, -1, -0.3);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-1.6, 1, -0.3);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-1.6, -1, -0.3);
    vehicle.addWheel(options);

    vehicle.addToWorld(world);

    var wheelBodies = [];
    for(var i=0; i<vehicle.wheelInfos.length; i++){
        var wheel = vehicle.wheelInfos[i];
        var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
        var wheelBody = new CANNON.Body({ mass: 100 });
        var q = new CANNON.Quaternion();
        q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
        wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
        wheelBodies.push(wheelBody);
        demo.addVisual(wheelBody);
    }

    // Update wheels
    world.addEventListener('postStep', function(){
        for (var i = 0; i < vehicle.wheelInfos.length; i++) {
            vehicle.updateWheelTransform(i);
            var t = vehicle.wheelInfos[i].worldTransform;
            wheelBodies[i].position.copy(t.position);
            wheelBodies[i].quaternion.copy(t.quaternion);
            positieX = chassisBody.position.x;
            positieZ = wheelBodies[0].position.z;
            chassisBody.position.y = 0;
            chassisBody.quaternion.z = 0;
            chassisBody.quaternion.x = 0;

        }
        if(-(positieX / 49) + 6 > segments){
            segments++;
            createNewTrack()
        }
        if(automatic == true) {
            vehicle.applyEngineForce(100, 0);
            vehicle.applyEngineForce(100, 1);
            vehicle.applyEngineForce(100, 2);
            vehicle.applyEngineForce(100, 3);
        }

        if(endpoint > wheelBodies[3].position.x + 30)
        {
            endpoint = wheelBodies[3].position.x + 30;
            // vehicle.setBrake(brakeForce, 2);
            // vehicle.setBrake(brakeForce, 3);
            wallBody.position.set(endpoint, chassisBody.position.y, chassisBody.position.z);
        }
        else
        {
            wallBody.position.set(endpoint, chassisBody.position.y, chassisBody.position.z);
        }
        // wallBody.quaternion.x = 0;
        // wallBody.quaternion.y = 0;
        // wallBody.quaternion.z = 0;





    });

    createInitialTrack();


    function createInitialTrack(){
        var matrix = [];
        var sizeX = 100,
            sizeY = 12;

        for (var i = 0; i < sizeX; i++) {
            matrix.push([]);
            for (var j = 0; j < sizeY; j++) {
                var height = 20;
                if(j === 0 || j === 11){
                    height = 10;
                }
                matrix[i].push(height);
            }
        }

        var hfShape = new CANNON.Heightfield(matrix, {
            elementSize: 1 / 200 * sizeX
        });
        var hfBody = new CANNON.Body({mass: 0});
        hfBody.addShape(hfShape);
        hfBody.position.set(-sizeX * hfShape.elementSize / 2, -sizeY * hfShape.elementSize / 2, -1);
        world.add(hfBody);
        demo.addVisual(hfBody);
        removebaanarray.push(hfBody);
        removebaan++;
    }

    function createNewTrack() {
        var matrix = [];
        var sizeX = 100,
            sizeY = 12;

        var randomPoints = [];
        var yUp = 0.2 * (Math.random() - 0.5);
        for (var i = 0; i < sizeX; i++) {
            if (i != 0) {
                point = randomPoints[i - 1] + THREE.Math.randFloat(-0.1, 0.1) + yUp;
            }
            randomPoints.push(point);
        }
        randomPoints.reverse();
        for (var i = 0; i < sizeX; i++) {
            matrix.push([]);
            for (var j = 0; j < sizeY; j++) {
                var height = randomPoints[i] + 20;
                if(i < 49)
                {
                    height = presetArray1[i]+ randomPoints[49] + 20;
                    point = height - 20;
                }
                if(j === 0 || j === 11){
                    height = randomPoints[i] +10;
                }
                matrix[i].push(height);
            }
        }


        var hfShape = new CANNON.Heightfield(matrix, {
            elementSize: 1 / 200 * sizeX
        });
        var hfBody = new CANNON.Body({mass: 0});
        hfBody.addShape(hfShape);
        hfBody.position.set((-sizeX * hfShape.elementSize / 2) + segments * -49, -sizeY * hfShape.elementSize / 2, -1);
        hfBody.color1 = 0x0000ff;
        world.add(hfBody);
        demo.addVisual(hfBody);
        removebaanarray.push(hfBody);
        removebaan++;

        if(removebaan > 8)
        {
                    world.remove(removebaanarray[removebaan - 9]);
                    demo.removeVisual(removebaanarray[removebaan - 9]);
        }
    }

});

demo.start();

document.onkeydown = handler;
document.onkeyup = handler;

var maxSteerVal = 0.5;
var maxForce = 300;
var brakeForce = 10;

function handler(event){



    var up = (event.type == 'keyup');

    if(!up && event.type !== 'keydown'){
        return;
    }

    vehicle.setBrake(0, 0);
    vehicle.setBrake(0, 1);
    vehicle.setBrake(0, 2);
    vehicle.setBrake(0, 3);



    switch(event.keyCode){

        case 39: // forward
            vehicle.applyEngineForce(up ? 0 : maxForce, 0);
            vehicle.applyEngineForce(up ? 0 : maxForce, 1);
            vehicle.applyEngineForce(up ? 0 : maxForce, 2);
            vehicle.applyEngineForce(up ? 0 : maxForce, 3);
            break;

        case 37: // backward
            vehicle.applyEngineForce(up ? 0 : -maxForce, 0);
            vehicle.applyEngineForce(up ? 0 : -maxForce, 1);
            break;

        case 66: // b
            vehicle.setBrake(brakeForce, 0);
            vehicle.setBrake(brakeForce, 1);
            vehicle.setBrake(brakeForce, 2);
            vehicle.setBrake(brakeForce, 3);
            chassisBody.quaternion.x = 0;
            break;

        case 76:
            if(!automatic) {
                automatic = true;
            }
            else{
                automatic = false;
            }
            break;

//            case 39: // right
//                vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
//                vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1);
//                break;
//
//            case 37: // left
//                vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
//                vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1);
//                break;

    }
}