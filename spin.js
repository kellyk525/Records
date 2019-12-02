
// SETTING THE COLORS

var Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    pink: 0xF5986E,
    brownDark: 0x23190f,
    blue: 0x68c3c0,
};

// All the THREEJS RELATED VARIABLES

var scene, camera, renderer, HEIGHT, WIDTH, fieldOfView, aspectRatio, nearPlane, farPlane, container

// SET UP/CREATE THE SCENE, CAMERA, AND RENDERER

function createScene() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    // Retrieve the width and height of the screen
    // Use them to set the aspect ratio of the camera
    // And the size of the renderer

    scene = new THREE.Scene();
    // Create the scene

    scene.fog = new THREE.FogExp2(0x11111f, 0.002);
    // Add a fog effect to the scene, same color as the background color

    //  CAMERA ------------------------------

    aspectRatio = WIDTH/HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    // Create the camera

    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = 100;
    //  SEt the position of the camera

    //  RENDERER ------------------------------
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    //  Create the renderer
    // alpha -- allow transparency to show the gradient background we have in the CSS
    // antialias -- Activate the anti-aliasing

    renderer.setClearColor(scene.fog.color);
    renderer.setSize(WIDTH, HEIGHT)
    // Define the size of the renderer
    //  In this case, it will fill the entire screen

    // renderer.setClearColor(0xffaa00, 1);
    renderer.shadowMap.enabled = true;
    // Enable shadow rendering

    container = document.getElementById('world');
    container.appendChild(renderer.domElement);
    // Add the DOM element to the container we created in the HTML file

    window.addEventListener('resize', handleWindowResize, false)
    // Listen to the screen: if the user resizes it, we have to update the camera (aspect ratio) and the renderer size
}

// HANDLE SCREEN EVENTS

function handleWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

// THE LIGHTS

var hemisphereLight, shadowLight;

function createLights() {
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)
    // hemisphereLight ---- gradient colored light
    // first param --- sky color
    //  second param --- ground color
    // third param --- intensity of the light

    shadowLight = new THREE.DirectionalLight()
    // directional light shines from a specific direction
    // Acts like the sun, which means that all the rays produced are parallel

    shadowLight.position.set(150, 350, 350);
    // set the position of the light

    shadowLight.castShadow = true;
    // allow shadow casting

    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;
    // define the visible area of the projected shadow

    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
    // define the resolution of the shadow; the higher the better,
    // but also the more expensive and less performant

    scene.add(hemisphereLight);
    scene.add(shadowLight);
    // to activate the lights, add them to the scene

}


// CREATE AN OBJECT
// CREATE THE CYLINDER FOR THE SEA

// Define a sea object:
Sea = function() {
    var geom = new THREE.CylinderGeometry(600,600,800,40,10);
    // geometric shape of a cylinder 
    // params: radius top, radius bottom, height, num of segments on the radius, num of segments vertically
    
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    // rotate the geometry on the x-axis

    var mat = new THREE.MeshPhongMaterial({
        color: Colors.red,
        transparent: true,
        opacity: .6,
        shading: THREE.FlatShading,
    })
    // create the material

    this.mesh = new THREE.Mesh(geom, mat);
    // To create an object in threejs, need to create a mesh -- which is a combination of the geometry and material

    this.mesh.receiveShadow = true;
    // Allow the sea to receive shadows
}

// Instantiate the sea and add it to the scene
var sea;

function createSea() {
    sea = new Sea();
    
    sea.mesh.position.y = -600;
    // push it a little bit at the bottom of the scene
    scene.add(sea.mesh);
    // add the mesh of the sea to the scene
}


// CREATE THE CUBES FOR THE CLOUDS
//  CHANGE THE COLORS
// CHANGE THE SIZE!!!

Cloud = function() {
    this.mesh = new THREE.Object3D();
    // Create an empty container that will hold all the objects

    var geom = new THREE.BoxGeometry(20,20,20);
    var mat = new THREE.MeshPhongMaterial({color: Colors.red});
    // Create the cube geometry
    // This shape will be duplicated to create the cloud
    // Create a simple white material


    // duplicate the geometry a random number of times
    var nBlocs = 3 + Math.floor(Math.random()*3);
    for (var i = 0; i < nBlocs; i ++) {
        var m = new THREE.Mesh(geom, mat)
        // create the mesh by cloning the geometry
        m.position.x = i*15;
        m.position.y = Math.random() * 10;
        m.position.z = Math.random() * 10;
        m.rotation.z = Math.random() * Math.PI * 2;
        m.rotation.y = Math.random() * Math.PI * 2;

        var s = 0.1 + Math.random() * 0.9;
        m.scale.set(s,s,s);
        //  set the position and rotation of each cube randomly

        m.castShadow = true;
        m.receiveShadow = true;
        // allow each cube to cast and to receive shadows

        this.mesh.add(m);
        // add the cube to the container we first created
    }
}


// Define a sky object 

Sky = function() {

    this.mesh = new THREE.Object3D();
    // Create an empty container

    this.nClouds = 20;
    // choose number of clouds to be scattered in the sky

    this.clouds = [];

    var stepAngle = Math.PI*2 / this.nClouds
    // To distribute the clouds consistently, we would need to place them according to a uniform angle

    for (var i=0; i < this.nClouds; i++) {
        var c = new Cloud();
        this.clouds.push(c);
        // Now we need to set the rotation and the position of each cloud using trigonometry
        var a = stepAngle * i;

        // This is the final angle of the cloud
        var h = 750 + Math.random() * 200;
        // distance between the center of the axis and the cloud itself

        c.mesh.position.y = Math.sin(a) * h;
        c.mesh.position.x = Math.cos(a) * h;
        // Trig ---
        // Converting polar coordinates (angle, distance) into Cartesian coordinates (x,y)

        c.mesh.rotation.z = a + Math.PI / 2;
        // Rotate the cloud according to its position

        c.mesh.position.z = -400 - Math.random() * 400;
        // for a better result, we position the clouds at random depths inside of the scene

        var s = 1 + Math.random() * 2;
        c.mesh.scale.set(s, s, s);
        // set a random scale for each cloud

        this.mesh.add(c.mesh);
        // Add the mesh of each cloud in the scene
    }
}


//  Now we instantiate the sky and push its center a bit towards the bottom of the screen
var sky;

function createSky() {
    sky = new Sky();
    sky.mesh.position.y = -600;
    scene.add(sky.mesh);
}



AirPlane = function() {
    this.mesh = new THREE.Object3D();

    // Create the cabin
    // var geomCabin = new THREE.BoxGeometry(60,50,50,1,1,1);
    // var matCabin = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading})
    // var cabin = new THREE.Mesh(geomCabin, matCabin);
    // cabin.castShadow = true;
    // cabin.receiveShadow = true;
    // this.mesh.add(cabin);

    // Create the engine
    // var geoEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
    // var matEngine = new THREE.MeshPhongMaterial({color: Colors.white, shading: THREE.FlatShading})
    // var engine = new THREE.Mesh(geoEngine, matEngine);
    // engine.position.x = 40;
    // engine.castShadow = true;
    // engine.receiveShadow = true;
    // this.mesh.add(engine);

    // Create the tail
    // var geomTail = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    // var meshTail = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading })
    // var tail = new THREE.Mesh(geomTail, meshTail);
    // tail.position.set(-35, 25, 0);
    // tail.castShadow = true;
    // tail.receiveShadow = true;
    // this.mesh.add(tail);

    // Create the wing
    // var geomWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
    // var matWing = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading })
    // // {width: 1, height: 1, depth: 1, widthSegments: undefined, heightSegments: undefined, depthSegments: undefined}
    // var sideWing = new THREE.Mesh(geomWing, matWing);
    // sideWing.castShadow = true;
    // sideWing.receiveShadow = true;
    // this.mesh.add(sideWing);

    // propeller
    var geomPropeller = new THREE.BoxGeometry(15, 10, 6, 1, 1, 1);
    var matPropeller = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    // blades
    var geomBlade = new THREE.BoxGeometry(2, 60, 1, 1,1,1);
    var matBlade = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading });
    var blade = new THREE.Mesh(geomBlade, matBlade);
    blade.position.set(8,0,0);
    blade.castShadow = true;
    blade.receiveShadow = true;

    this.propeller.add(blade);
    this.propeller.position.set(52,0,0);
    this.mesh.add(this.propeller);

    // Create the circle wing
    var geomCircle = new THREE.TorusGeometry(60, 4.5, 16, 100);
    var matCircle = new THREE.MeshBasicMaterial({ color: Colors.red, shading: THREE.FlatShading })
    var circle = new THREE.Mesh(geomCircle, matCircle);
    circle.position.set(8,-40,0);
    circle.rotation.x = Math.PI /2;
    circle.castShadow = true;
    circle.receiveShadow = true;
    this.mesh.add(circle);

    // Create the main part

    var geomMain = new THREE.SphereBufferGeometry(40, 40, 40, 0, Math.PI*2, 0, Math.PI/2)
    var matMain = new THREE.MeshBasicMaterial({ color: Colors.blue, shading: THREE.FlatShading })
    var main = new THREE.Mesh(geomMain, matMain);
    main.side = THREE.DoubleSide;
    main.position.y = 10;
    main.position.x = 8;
    main.position.z = 8;
    main.rotation.x = Math.PI;
    main.castShadow = true;
    main.receiveShadow = true;
    this.mesh.add(main);

    // Create the lid
    var geomLid = new THREE.SphereBufferGeometry(36,40,40,0, Math.PI*2, 0, Math.PI/2)
    var matLid = new THREE.MeshPhongMaterial({
        color: Colors.blue,
        transparent: true,
        opacity: .3,
        shading: THREE.FlatShading,
    })
    var lid = new THREE.Mesh(geomLid, matLid);
    lid.side = THREE.BackSide;
    lid.position.y = 8;
    lid.position.x = 7.2;
    this.mesh.add(lid);

    var geomAttack = new THREE.TetrahedronGeometry(50, 2);
    var matAttack = new THREE.MeshPhongMaterial({ color: Colors.red, shininess: 0, specular: 0xffffff});
    var attack = new THREE.Mesh(geomAttack, matAttack);
    attack.position.y = 80;
    attack.position.x = 120;
    attack.castShadow = true;
    this.mesh.add(attack);

    this.light = new THREE.PointLight(0x062d89, 30, 500, 1.7);
    this.light.position.set(200, 300, 100);
    this.mesh.add(this.light);

    ambient = new THREE.AmbientLight(0x555555);
    this.mesh.add(ambient);
    directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(100, 0, 1);
    this.mesh.add(directionalLight);


}


var airplane;
 
function createPlane() {
    airplane = new AirPlane();
    airplane.mesh.scale.set(0.17, 0.17, 0.17);
    airplane.mesh.position.y = 100;
    scene.add(airplane.mesh);
}


Rain = function () {

    this.mesh = new THREE.Object3D();
    let rainCount = 15000;

    this.rainGeo = new THREE.Geometry();
    for (let i = 0; i < rainCount; i++) {
        rainDrop = new THREE.Vector3(Math.random() * 400 - 200, Math.random() * 500 - 250, Math.random() * 400 - 200);
        rainDrop.velocity = {};
        rainDrop.velocity = 0;
        this.rainGeo.vertices.push(rainDrop);
    }
    rainMaterial = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.1, transparent: true });
    rain = new THREE.Points(this.rainGeo, rainMaterial);

    this.mesh.add(rain);
}


var rain;

function createRain() {
    rain = new Rain();
    // rain.mesh.position.y = 140;
    scene.add(rain.mesh)
}




Hurricane = function () {
    this.mesh = new THREE.Object3D();

    var texture = new THREE.TextureLoader().load("smoke-th.png");

    // var geomHurricane = new THREE.PlaneBufferGeometry(100, 100);
    // var matHurricane = new THREE.MeshLambertMaterial({ color: Colors.blue });

    // var h = new THREE.Mesh(geomHurricane, matHurricane)
    // h.position.x = 0;
    // // h.material.opacity = 0.6;
    // // h.receiveShadow = true;
    // this.mesh.add(h);
    
    // var geomAttack = new THREE.PlaneBufferGeometry(300, 300);
    // var matAttack = new THREE.MeshLambertMaterial({ map: texture, transparent: true  });
    // var attack = new THREE.Mesh(geomAttack, matAttack);
    // // attacsk.position.y = 80;
    // attack.material.opacity = 0.4;
    // attack.rotation.x = 1;
    // attack.position.z = -200;
    // attack.position.x = 300;
    // // attack.position.y = 50;
    // attack.castShadow = true;
    // attack.receiveShadow = true;
    // this.mesh.add(attack);

    // c.mesh.position.z = -400 - Math.random() * 400;
    // for a better result, we position the clouds at random depths inside of the scene

    // var s = 1 + Math.random() * 2;
    // c.mesh.scale.set(s, s, s);

    var geomAttack2 = new THREE.PlaneBufferGeometry(500, 500);
    var matAttack2 = new THREE.MeshLambertMaterial({ map: texture, transparent: true });
    var attack2 = new THREE.Mesh(geomAttack2, matAttack2);
    // attacsk.position.y = 80;
    attack2.material.opacity = 0.4;
    attack2.rotation.x = 1;
    attack2.position.z = -200;
    attack2.position.x = 100;
    attack2.castShadow = true;
    attack2.receiveShadow = true;
    this.mesh.add(attack2);

    var geomAttack3 = new THREE.PlaneBufferGeometry(500, 500);
    var matAttack3 = new THREE.MeshLambertMaterial({ map: texture, transparent: true });
    var attack3 = new THREE.Mesh(geomAttack3, matAttack3);
    // attacsk.position.y = 80;
    attack3.material.opacity = 0.4;
    attack3.rotation.x = 1;
    attack3.position.z = -200;
    attack3.position.x = -250;
    attack3.castShadow = true;
    attack3.receiveShadow = true;
    this.mesh.add(attack3);

}

var hurricane;

function createHurricane() {
    hurricane = new Hurricane();
    hurricane.mesh.position.y = 140;
    scene.add(hurricane.mesh)
}


Coin = function () {
    var geom = new THREE.TetrahedronGeometry(5, 0);
    var mat = new THREE.MeshPhongMaterial({
        color: 0x009999,
        shininess: 0,
        specular: 0xffffff,

        shading: THREE.FlatShading
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.castShadow = true;
    this.angle = 0;
    this.dist = 0;
}

function createCoins() {
    coin = new Coin();
    scene.add(coin.mesh);
}



var mousePos = {x:0, y:0};
// now handle the mousemove event
// normalize the x and y position of the mouse
function handleMouseMove(event) {
    //  convert the mouse position received to a normalized
    // value varying between -1 and 1
    // formula for the horizontal axis:
    var tx = - 1 + (event.clientX / WIDTH) * 2

    // for the vertical axis, we need to inverse the formula
    // because the 2D y-axis goes the opposite direction of the 3D y-axis
    var ty = 1 - (event.clientY / HEIGHT) * 2
    mousePos = {x:tx, y:ty};
}

function updatePlane() {
    // move the plane btw -100 and 100 on the horiz. axis
    // btw 25 and 175 on the vertical axis
    // depending on the mouse position, which ranges from -1 and 1 on both axes
    //  to achieve this we use a normalize function
    
    var targetX = normalize(mousePos.x, -.75, .75, -100, 100);
    var targetY = normalize(mousePos.y, -.75, .75, 25, 175);
    

    // Move the plane at each frame by adding a fraction of the remaining distance
    airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * 0.1;

    // Rotate the plane proportionally to the remaining distance
    airplane.mesh.rotation.z = (targetY - airplane.mesh.position.y) * 0.0128;
    airplane.mesh.rotation.x = (airplane.mesh.position.y - targetY) * 0.0064;


    // // update the airplane's position
    // airplane.mesh.position.y = targetY;
    // airplane.mesh.position.x = targetX;
    // airplane.propeller.rotation.x += 0.3;
}

function normalize (v, vmin, vmax, tmin, tmax) {
    var nv = Math.max(Math.min(v, vmax), vmin);
    var dv = vmax - vmin;
    var pc = (nv - vmin) / dv;
    var dt = tmax - tmin;
    var tv = tmin + (pc * dt);
    return tv;
}

// PLACE THAT WILL RENDER THE SCENE AND BRING LIFE TO THE OBJECTS

//  Create an infinite loop 
function loop() {
    // airplane.propeller.rotation.x += 0.3; ---- include this in updatePlane
    sea.mesh.rotation.z += 0.005;
    sky.mesh.rotation.z += 0.01;
    // rotate the propeller, sea, and the sky

    rain.rainGeo.vertices.forEach(p => {
        p.velocity -= 0.1 + Math.random() * 0.1;
        p.y += p.velocity;
        if (p.y < -200) {
            p.y = 200;
            p.velocity = 0;
        }
    });
    rain.rainGeo.verticesNeedUpdate = true;
    rain.mesh.rotation.y += 0.002;
    if (Math.random() > 0.93 || airplane.light.power > 100) {
        if (airplane.light.power < 100)
            airplane.light.position.set( Math.random() * 400, 300 + Math.random() * 200, 100);
            airplane.light.power = 50 + Math.random() * 500;
    }

    updatePlane();

    renderer.render(scene, camera);
    // render the scene
    requestAnimationFrame(loop);
    // call the loop function again
}

// We have moved the call to the render method to the loop function, because each change we make to an object needs to be rendered again.



// THE INIT FUNCTION WITH ALL THE FUNCTIONS

function init(event) {
    createScene();
    createLights();
    createSea();
    createSky();
    createPlane();
    createCoins();
    createHurricane();
    createRain();
    // createAttack();
    document.addEventListener('mousemove', handleMouseMove, false);
    // Add the event listener

    loop();
}

window.addEventListener('load', init, false);

