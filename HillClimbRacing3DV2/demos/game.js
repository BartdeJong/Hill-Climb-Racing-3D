var demo = new CANNON.Demo();
var mass = 150;
var vehicle;
var positieX = 0;
var positieZ = 0;
var positieXwheel = 0;
var positieZwheel = 0;
var last = 0;
var segments = 0;
var point = 0;
var automatic = false;
var removebaan = 0;
var removebaanarray = [];
var endpoint = 0;
var randomTrack = 0;
var wheelposX;
var wheelposZ;
var fuel = 100;
var fuelUsage = 0.7;
var score = 0;
var BoxColor = 0;
var CylinderColor = 0;
var fuelCounter = 25;
var nextFuel = 200;
var fuelArray = [];
var makeFuel = false;

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

    var chassisShapeTop;
    chassisShapeTop = new CANNON.Box(new CANNON.Vec3(1, 1,0.5));

    BoxColor = 1;
    var chassisShape;
    chassisShape = new CANNON.Box(new CANNON.Vec3(2, 1,0.5));
    var chassisBody = new CANNON.Body({ mass: mass });
    chassisBody.addShape(chassisShape);
    chassisBody.addShape(chassisShapeTop, new CANNON.Vec3(0.4 ,0 ,0.99));
    chassisBody.position.set(-10, 0, 24);
    chassisBody.angularVelocity.set(0, 0, 0.5);
    demo.addVisual(chassisBody);
    BoxColor = 0;
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
    CylinderColor = 1;
    var wheelBodies = [];
    for(var i=0; i<vehicle.wheelInfos.length; i++){
        var wheel = vehicle.wheelInfos[i];
        var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 1.5, 20);
        var wheelBody = new CANNON.Body({ mass: 100 });
        var q = new CANNON.Quaternion();
        q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
        wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
        wheelBodies.push(wheelBody);
        demo.addVisual(wheelBody);
    }
    CylinderColor = 0;
    // Update wheels
    world.addEventListener('postStep', function(){
        for (var i = 0; i < vehicle.wheelInfos.length; i++) {
            vehicle.updateWheelTransform(i);
            var t = vehicle.wheelInfos[i].worldTransform;
            wheelBodies[i].position.copy(t.position);
            wheelBodies[i].quaternion.copy(t.quaternion);
            positieX = chassisBody.position.x;
            positieXwheel = (wheelBodies[0].position.x + wheelBodies[2].position.x) / 2;
            positieZwheel = (wheelBodies[0].position.z + wheelBodies[2].position.z) / 2;
            positieZ = chassisBody.position.z;
            chassisBody.position.y = 0;
            chassisBody.quaternion.z = 0;
            chassisBody.quaternion.x = 0;
            wheelposX = wheelBodies[0].position.x;
            wheelposZ = wheelBodies[0].position.z;
            $("#totalfuel").text(Math.floor(fuel));
            if(-score > chassisBody.position.x){
                score = -chassisBody.position.x;
                $("#totalhighscore").text(Math.floor(score) - 10);
            }
            for(var j = 0; j < fuelArray.length; j++){
                if(fuelArray[j].position.x > chassisBody.position.x){
                    demo.removeVisual(fuelArray[j]);
                    fuel = 100;
                    fuelArray.splice(0, 1);
                }
            }
            if(score > 11) {
                if (chassisBody.velocity.x > -0.1 && chassisBody.velocity.x < 0.1 && wheelBodies[0].position.x < wheelBodies[2].position.x || fuel <= 0 && chassisBody.velocity.x > -0.1 && chassisBody.velocity.x < 0.1) {
                    alert("af");
                }
            }
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
        var lastHeight;

        var randomPoints = [];
        var yUp = 0.2 * (Math.random() - 0.5);
        for (var i = 0; i < sizeX; i++) {
            if (i != 0) {
                point = randomPoints[i - 1] + THREE.Math.randFloat(-0.1, 0.1) + yUp;
            }
            randomPoints.push(point);
            fuelCounter++;
            if(fuelCounter >= nextFuel){
                fuelCounter = 0;
                nextFuel += 50;
                makeFuel = true;
            }
        }
        randomTrack = Math.floor((Math.random() * 5));
         //randomTrack = 4;
        randomPoints.reverse();



        for (var i = 0; i < sizeX; i++) {
            matrix.push([]);
            for (var j = 0; j < sizeY; j++) {
                var height = + (Math.random()/13) + randomPoints[i] + 20 ;
                if(i < 49)
                {
                    switch(randomTrack) {
                        case 0://sinus
                            height = Math.sin(i * 0.2)+ (Math.random()/13) + randomPoints[49] + 20;
                            point = height - 20;
                            lastHeight = height;
                            break;

                        case 1://rechtvlak
                            height = presetArray1[i]+ (Math.random()/13) + randomPoints[49] + 20;
                            point = height - 20;
                            lastHeight = height;
                            break;

                        case 2://cos
                            height = 1.1* Math.cos(i * 0.1)+ (Math.random()/13) + randomPoints[49] + 20;
                            point = height - 19;
                            lastHeight = height;
                            break;

                        case 3://cos
                            height = 1.1* Math.sin(i * 0.09)+ (Math.random()/13) + randomPoints[49] + 21;
                            point = height - 22;
                            lastHeight = height;
                            break;

                        case 4://cos, hobbelig
                            height = 1.1* Math.cos(i * 0.08)+ (Math.random()/3) + randomPoints[49] + 21;
                            point = height - 18.2;
                            lastHeight = height;
                            break;
                    }
                }
                if(j === 0 || j === 11){
                    height = randomPoints[i] +10;
                }
                matrix[i].push(height);
            }
        }

        CylinderColor = 2;
        if(makeFuel == true) {
            var fuelShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius * 2.5, 20);
            var fuelBody = new CANNON.Body({mass: 100});
            fuelBody.addShape(fuelShape);
            fuelBody.position.x = (-sizeX * 0.5 / 2) + segments * -49 + 25;
            fuelBody.position.z = lastHeight + 0.5;
            demo.addVisual(fuelBody);
            fuelArray.push(fuelBody);
            makeFuel = false;

        }
        CylinderColor = 0;
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

        if(removebaan > 10)
        {
                    world.remove(removebaanarray[removebaan - 9]);
                    demo.removeVisual(removebaanarray[removebaan - 9]);
                    delete removebaanarray[removebaan - 9];
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
            if(fuel > 0) {
                vehicle.applyEngineForce(up ? 0 : maxForce, 0);
                vehicle.applyEngineForce(up ? 0 : maxForce, 1);
                vehicle.applyEngineForce(up ? 0 : maxForce, 2);
                vehicle.applyEngineForce(up ? 0 : maxForce, 3);
                fuel -= fuelUsage;
            }
            else {
                vehicle.applyEngineForce(up ? 0 : 0, 0);
                vehicle.applyEngineForce(up ? 0 : 0, 1);
                vehicle.applyEngineForce(up ? 0 : 0, 2);
                vehicle.applyEngineForce(up ? 0 : 0, 3);
                fuel = 0;
            }
            break;

        case 37: // backward
            if(fuel > 0) {
                vehicle.applyEngineForce(up ? 0 : -maxForce, 0);
                vehicle.applyEngineForce(up ? 0 : -maxForce, 1);
                vehicle.applyEngineForce(up ? 0 : -maxForce, 2);
                vehicle.applyEngineForce(up ? 0 : -maxForce, 3);
                fuel -= fuelUsage;
            }
            else {
                vehicle.applyEngineForce(up ? 0 : 0, 0);
                vehicle.applyEngineForce(up ? 0 : 0, 1);
                vehicle.applyEngineForce(up ? 0 : 0, 2);
                vehicle.applyEngineForce(up ? 0 : 0, 3);
                fuel = 0;
            }
            break;

        case 66: // b
            vehicle.setBrake(brakeForce, 0);
            vehicle.setBrake(brakeForce, 1);
            vehicle.setBrake(brakeForce, 2);
            vehicle.setBrake(brakeForce, 3);
            break;

        case 70:
            fuel += 5;
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