

Hurricane = function () {
    this.mesh = new THREE.Object3D();

    let loader = new THREE.TextureLoader();
    loader.load("smoke-th.png", function(texture) {

        var geomHurricane = new THREE.PlaneBufferGeometry(100, 100);
        var matHurricane = new THREE.MeshLambertMaterial({ map: texture, transparent: true });
        var h = new THREE.Mesh(geomHurricane, matHurricane)
        this.mesh.add(h);
        h.position.x = 0;
    }
}

var hurricane;

function createHurricane() {
    hurricane = new Hurricane();
    hurricane.mesh.position.y = 140;
    scene.add(hurricane.mesh)
}
