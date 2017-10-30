var demo = new CANNON.Demo();
var mass = 10;
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
var fuelUsage = 0.22;
var score = 0;
var BoxColor = 0;
var CylinderColor = 0;
var fuelCounter = 25;
var nextFuel = 200;
var makeFuel = false;
var restartAlles = false;
var gameOver = false;
var treeSide = 0;
var teller = 0;
var teller2 = 0;
var terrain = 0;
var terrainvalue = 1020;
var clock = new THREE.Clock();
clock.start();
var delta;
var soundSpeed = 1;


var fuelArray = [];
var dommeblokjes = [];
var BottomTreeArray = [];
var TopTreeArray = [];
var SpikeArray = [];
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
    chassisBody.position.set(-10, 0, 20);
    chassisBody.angularVelocity.set(0, 0, 0.5);
    demo.addVisual(chassisBody);
    BoxColor = 0;
    var options = {
        radius: 0.5,
        directionLocal: new CANNON.Vec3(0, 0, -1),
        suspensionStiffness: 20,
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

    options.chassisConnectionPointLocal.set(-1.6, 1, -0.5);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-1.6, -1, -0.5);
    vehicle.addWheel(options);

    vehicle.addToWorld(world);
    CylinderColor = 1;
    var wheelBodies = [];
    for(var i=0; i<vehicle.wheelInfos.length; i++){
        var wheel = vehicle.wheelInfos[i];
        var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 1.5, 20);
        var wheelBody = new CANNON.Body({ mass: 1 });
        var q = new CANNON.Quaternion();
        q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
        wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
        wheelBodies.push(wheelBody);
        demo.addVisual(wheelBody);
    }
    CylinderColor = 0;
    // Update wheels
    world.addEventListener('postStep', function(){
        if(chassisBody.velocity.z < -30){
            location.reload();
        }
        if(chassisBody.position.x < -2010){
            location.reload();
        }
        delta  += clock.getDelta();
        soundSpeed = -chassisBody.velocity.x / 30;
        for (var i = 0; i < vehicle.wheelInfos.length; i++) {
            vehicle.updateWheelTransform(i);
            var t = vehicle.wheelInfos[i].worldTransform;
            wheelBodies[i].position.copy(t.position);
            wheelBodies[i].quaternion.copy(t.quaternion);
        }
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
            if(gameOver)
            {
                chassisBody.velocity.x = 0;
                chassisBody.velocity.y = 0;
                chassisBody.velocity.z = 0;
            }
            for(var j = 0; j < fuelArray.length; j++){
                if(fuelArray[j].position.x > chassisBody.position.x){
                    demo.removeVisual(fuelArray[j]);
                    fuel = 100;
                    fuelArray.splice(0, 1);
                }
            }
            if(terrain == 0) {
                for (var i2 = 0; i2 < BottomTreeArray.length; i2++) {
                    if (BottomTreeArray[i2].position.x > chassisBody.position.x + 30) {
                        BottomTreeArray[i2].position.x = chassisBody.position.x - 160 - Math.floor((Math.random() * -10) + 0);
                        BottomTreeArray[i2].position.z = chassisBody.position.z - 30;
                        TopTreeArray[i2].position.x = BottomTreeArray[i2].position.x;
                        TopTreeArray[i2].position.z = chassisBody.position.z - 10;
                        if (BottomTreeArray[i2].position.y < 0) {
                            BottomTreeArray[i2].position.z += 10;
                            TopTreeArray[i2].position.z += 10;
                        }
                    }
                }

            }

                for (var i3 = 0; i3 < SpikeArray.length; i3++)
                {
                    if(SpikeArray[i3].position.x > chassisBody.position.x +30) {
                        SpikeArray[i3].position.x = chassisBody.position.x - 160;
                        SpikeArray[i3].position.z = chassisBody.position.z - 20;
                        if (SpikeArray[i3].position.y < 0) {
                            SpikeArray[i3].position.z += 5;

                        }
                    }

                 }

            if(score > 11) {
                if (chassisBody.velocity.x > -0.1 && chassisBody.velocity.x < 0.1 && wheelBodies[0].position.x < wheelBodies[2].position.x || fuel <= 0 && chassisBody.velocity.x > -0.1 && chassisBody.velocity.x < 0.1) {
                    if(delta > 1) {
                        // $("#highscore").text(Math.round(score - 10));
                        // $("#gameover").fadeIn(1000);
                        // gameOver = true;
                        chassisBody.quaternion.y = 0;
                    }
                }
                else{
                    delta = 0;
                }
            }
            if(restartAlles){
                last = 0;
                segments = 0;
                point = 0;
                removebaan = 0;
                for(var i = 0; i < removebaanarray.length; i++){
                    if(removebaanarray[i] != null) {
                        world.remove(removebaanarray[i]);
                        demo.removeVisual(removebaanarray[i]);
                        delete removebaanarray[i];
                    }
                }
                removebaanarray = [];
                endpoint = 0;
                randomTrack = 0;
                fuel = 100;
                score = 0;
                nextFuel = 200;
                for(var i = 0; i < fuelArray.length; i++){
                    demo.removeVisual(fuelArray[i]);
                    delete fuelArray[i];
                }
                fuelArray = [];
                makeFuel = false;
                createInitialTrack();
                chassisBody.velocity.x = 0;
                chassisBody.velocity.y = 0;
                chassisBody.velocity.z = 0;
                chassisBody.position.set(-10, 0, 20);
                chassisBody.quaternion.y = 0;
                for(var j  =0; j < BottomTreeArray.length; j++)
                {
                    treeSide = Math.floor((Math.random() * 2) + 0);
                    BottomTreeArray[j].position.x = 20 +Math.floor((Math.random() * -160) + 0);
                    SpikeArray[j].position.x = chassisBody.position.x -terrainvalue +Math.floor((Math.random() * -160) + 0);
                    if(treeSide == 0) {
                        BottomTreeArray[j].position.y = (10)+((Math.random() * 20) + 0) ;
                        BottomTreeArray[j].position.z = (chassisBody.position.z - 40) +Math.floor((Math.random() * 10) + 5);
                        SpikeArray[j].position.y = (10)+((Math.random() * 20) + 0) ;
                        SpikeArray[j].position.z = (chassisBody.position.z - 40) +Math.floor((Math.random() * 10) + 25);
                    }
                    if(treeSide == 1) {
                        BottomTreeArray[j].position.y = (-10)+((Math.random() * -20) + 0) ;
                        BottomTreeArray[j].position.z = (chassisBody.position.z - 40) + Math.floor((Math.random() * 10) + 20);
                        SpikeArray[j].position.y = (-10)+((Math.random() * -20) + 0) ;
                        SpikeArray[j].position.z = (chassisBody.position.z - 40) +Math.floor((Math.random() * 10) +25);
                    }
                    TopTreeArray[j].position.set(BottomTreeArray[j].position.x,BottomTreeArray[j].position.y , BottomTreeArray[j].position.z+20);

                }
                terrain = 0;
                restartAlles = false;
                $("#gameover").fadeOut(1000);
                gameOver = false;
            }

        if(-(positieX / 49) + 6 > segments){
            segments++;
            createNewTrack()
        }

        vehicle.applyEngineForce(30, 0);
        vehicle.applyEngineForce(30, 1);
        vehicle.applyEngineForce(30, 2);
        vehicle.applyEngineForce(30, 3);


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

        teller2++;
        if(teller2 > 3) {
            wallShape2 = new CANNON.Box(new CANNON.Vec3(0.10, 0.10, 0.10));
            var wallBody2 = new CANNON.Body({mass: 0.0001});
            wallBody2.addShape(wallShape2);
            wallBody2.position.set(wheelBodies[0].position.x + 0.6, wheelBodies[0].position.y - 0.4, wheelBodies[0].position.z + 0.1);
            world.add(wallBody2);
            demo.addVisual(wallBody2);
            dommeblokjes.push(wallBody2);

            if (dommeblokjes.length > 15) {
                world.remove(dommeblokjes[0]);
                demo.removeVisual(dommeblokjes[0]);
                dommeblokjes.splice(0, 1);
            }
            for (var i = 0; i < dommeblokjes.length; i++) {
                dommeblokjes[i].position.x += 0.1;
            }
            teller2 = 0;
        }
        if (score > terrainvalue)
        {
            terrain = 1;
        }
        // if(score) {
        //     terrain = 0;
        //
        // }

        vehicle.setBrake(0, 0);
        vehicle.setBrake(0, 1);
        vehicle.setBrake(0, 2);
        vehicle.setBrake(0, 3);

    });


    createInitialTrack();
    createTrees();
    function createTrees() {
        for(var i = 0; i < 40; i++)
        {
            treeSide = Math.floor((Math.random() * 2) + 0);
            var treeBotShape = new CANNON.Box(new CANNON.Vec3(1,1,20))
            var TreeBodyBot = new CANNON.Body({ mass: mass });
            TreeBodyBot.addShape(treeBotShape);
            TreeBodyBot.position.x = 20 +Math.floor((Math.random() * -160) + 0);
            if(treeSide == 0) {
                TreeBodyBot.position.y = (10)+((Math.random() * 20) + 0) ;
                TreeBodyBot.position.z = (chassisBody.position.z - 40) +Math.floor((Math.random() * 10) + 5);

            }
            if(treeSide == 1) {
                TreeBodyBot.position.y = (-10)+((Math.random() * -20) + 0) ;
                TreeBodyBot.position.z = (chassisBody.position.z - 40) + Math.floor((Math.random() * 10) + 20);

            }
            demo.addVisual(TreeBodyBot);
            BottomTreeArray.push(TreeBodyBot);


            var treeTopShape = new CANNON.Box(new CANNON.Vec3(5,5,6))
            var TreeBodyTop = new CANNON.Body({ mass: mass });
            TreeBodyTop.addShape(treeTopShape);
            TreeBodyTop.position.set(BottomTreeArray[i].position.x,BottomTreeArray[i].position.y , BottomTreeArray[i].position.z+20);
            BoxColor = 2;
            demo.addVisual(TreeBodyTop);
            BoxColor = 0;
            TopTreeArray.push(TreeBodyTop);
        }

    }
    createSpikes();
    function createSpikes() {
        CylinderColor = 1;
        for(var i = 0; i <40; i++){
            treeSide = Math.floor((Math.random() * 2) + 0);
            var spikeTreeShape = new CANNON.Cylinder(0, -2, 65, 32);
            var spikeTreeBody = new CANNON.Body({ mass: mass });
            spikeTreeBody.addShape(spikeTreeShape);
            spikeTreeBody.position.x = chassisBody.position.x -terrainvalue +Math.floor((Math.random() * -160) + 0);
            if(treeSide == 0)
            {
                spikeTreeBody.position.y = (10)+((Math.random() * 20) + 0) ;
                spikeTreeBody.position.z = (chassisBody.position.z - 40) +Math.floor((Math.random() * 10) + 5);
            }
            if(treeSide == 1)
            {
                spikeTreeBody.position.y = (-10)+((Math.random() * -20) + 0) ;
                spikeTreeBody.position.z = (chassisBody.position.z - 40) +Math.floor((Math.random() * 10) +5);
            }

            demo.addVisual(spikeTreeBody);
            SpikeArray.push(spikeTreeBody);
        }
        CylinderColor = 0;
    }


    function createInitialTrack(){
        var matrix = [];
        var sizeX = 100,
            sizeY = 12;

        for (var i = 0; i < sizeX; i++) {
            matrix.push([]);
            for (var j = 0; j < sizeY; j++) {
                var height = 20;
                if(j === 0 || j === 11){
                    height = 18;
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
        var lastHeight2;

        var randomPoints = [];
        var yUp = 0.1 * (Math.random());
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
        randomTrack = Math.floor((Math.random() * 9));
        //randomTrack = 4;
        randomPoints.reverse();



        for (var i = 0; i < sizeX; i++) {
            matrix.push([]);
            for (var j = 0; j < sizeY; j++) {
                var height = + (Math.random()/13) + randomPoints[i] + 20 ;
                lastHeight2 = height;
                if(i < 49)
                {
                    switch(randomTrack) {
                        case 0://sinus
                            height = Math.sin(i * 0.2)+ (Math.random()/13) + randomPoints[49] + 20;
                            point = height - 20;
                            lastHeight = height;
                            lastHeight2 = height;
                            break;

                        case 1://rechtvlak
                            height = presetArray1[i]+ (Math.random()/13) + randomPoints[49] + 20;
                            point = height - 20;
                            lastHeight = height;
                            lastHeight2 = height;
                            break;

                        case 2://cos
                            height = 1.1* Math.cos(i * 0.1)+ (Math.random()/13) + randomPoints[49] + 20;
                            point = height - 19;
                            lastHeight = height;
                            lastHeight2 = height;
                            break;

                        case 3://cos
                            height = 1.1* Math.sin(i * 0.09)+ (Math.random()/13) + randomPoints[49] + 21;
                            point = height - 22;
                            lastHeight = height;
                            lastHeight2 = height - (50 - i) * 0.06;
                            break;

                        case 4://cos, hobbelig
                            height = 1.1* Math.cos(i * 0.08)+ (Math.random()/3) + randomPoints[49] + 21;
                            point = height - 18.2;
                            lastHeight = height;
                            lastHeight2 = height;
                            break;
                        case 5://cos
                            height = -1.1* Math.cos(i * 0.1)+ (Math.random()/13) + randomPoints[49] + 20;
                            point = height - 21;
                            lastHeight = height;
                            lastHeight2 = height;
                            break;
                        case 6://cos
                            height = -1.01* Math.cos(i * 0.15)+ (Math.random()/3) + randomPoints[49] + 20.5;
                            point = height - 21;
                            lastHeight = height;
                            lastHeight2 = height;
                            break;
                        case 7://cos
                            var presetarray = [1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0];
                            height = presetarray[i]+ (Math.random()/13) + randomPoints[49] + 19;
                            point = height - 20;
                            lastHeight = height;
                            lastHeight2 = height;
                            break;
                        case 8://cos
                            var presetarray1 = [0,0,0,0,0,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.2,-0.2,-0.2,-0.2,-0.2,-0.3,-0.3,-0.3,-0.3,-0.3,-0.4,-0.4,-0.4,-0.4,-0.4,-0.5,-0.5,-0.5,-0.5,-0.5,-0.6,-0.6,-0.6,-0.6,-0.6,-0.7,-0.7,-0.7,-0.7,-0.7,-0.8,-0.8,-0.8,-0.8,-0.8,-0.9,-0.9,-0.9,-0.9,-0.9];
                            presetarray1.reverse();
                            height = presetarray1[i]*2+ (Math.random()/13) + randomPoints[49] + 20;
                            point = height - 22;
                            lastHeight = height;
                            lastHeight2 = height;
                            break;
                    }
                }
                if(j === 0 || j === 11){
                    height = lastHeight2 - 2;
                }
                matrix[i].push(height);
            }
        }

        CylinderColor = 2;
        if(makeFuel == true) {
            var fuelShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius * 2.5, 20);
            var fuelBody = new CANNON.Body({mass: 10});
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
            world.remove(removebaanarray[0]);
            demo.removeVisual(removebaanarray[0]);
            removebaanarray.splice(0, 1);
        }
    }

});

demo.start();

document.onkeydown = handler;
document.onkeyup = handler;

var maxSteerVal = 0.5;
var maxForce = 900;
var brakeForce = 30;

function restartGame() {
    restartAlles = true;
}

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
                if(!gameOver) {
                    fuel -= fuelUsage;
                }
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
                if(vehicle.chassisBody.velocity.x >= 0) {
                    vehicle.applyEngineForce(up ? 0 : -maxForce, 0);
                    vehicle.applyEngineForce(up ? 0 : -maxForce, 1);
                    vehicle.applyEngineForce(up ? 0 : -maxForce, 2);
                    vehicle.applyEngineForce(up ? 0 : -maxForce, 3);
                    if (!gameOver) {
                        fuel -= fuelUsage;
                    }
                }
                else{
                    vehicle.setBrake(brakeForce, 0);
                    vehicle.setBrake(brakeForce, 1);
                    vehicle.setBrake(brakeForce, 2);
                    vehicle.setBrake(brakeForce, 3);
                }
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

        case 82:
            restartGame();
            break;

        case 79:
            vehicle.chassisBody.quaternion.y = 0;
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