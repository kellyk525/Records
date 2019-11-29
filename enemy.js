Ennemy = function () {
    var geom = new THREE.TetrahedronGeometry(8, 2);
    var mat = new THREE.MeshPhongMaterial({
        color: Colors.red,
        shininess: 0,
        specular: 0xffffff,
        shading: THREE.FlatShading
    }); 
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.castShadow = true;
    this.angle = 0;
    this.dist = 0;
}

EnnemiesHolder = function () {
    this.mesh = new THREE.Object3D();
    this.ennemiesInUse = [];
}

EnnemiesHolder.prototype.spawnEnnemies = function () {
    var nEnnemies = game.level;

    for (var i = 0; i < nEnnemies; i++) {
        var ennemy;
        if (ennemiesPool.length) {
            ennemy = ennemiesPool.pop();
        } else {
            ennemy = new Ennemy();
        }

        ennemy.angle = - (i * 0.1);
        ennemy.distance = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight - 20);
        ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle) * ennemy.distance;
        ennemy.mesh.position.x = Math.cos(ennemy.angle) * ennemy.distance;

        this.mesh.add(ennemy.mesh);
        this.ennemiesInUse.push(ennemy);
    }
}

EnnemiesHolder.prototype.rotateEnnemies = function () {
    for (var i = 0; i < this.ennemiesInUse.length; i++) {
        var ennemy = this.ennemiesInUse[i];
        ennemy.angle += game.speed * deltaTime * game.ennemiesSpeed;

        if (ennemy.angle > Math.PI * 2) ennemy.angle -= Math.PI * 2;

        ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle) * ennemy.distance;
        ennemy.mesh.position.x = Math.cos(ennemy.angle) * ennemy.distance;
        ennemy.mesh.rotation.z += Math.random() * .1;
        ennemy.mesh.rotation.y += Math.random() * .1;

        //var globalEnnemyPosition =  ennemy.mesh.localToWorld(new THREE.Vector3());
        var diffPos = airplane.mesh.position.clone().sub(ennemy.mesh.position.clone());
        var d = diffPos.length();
        if (d < game.ennemyDistanceTolerance) {
            particlesHolder.spawnParticles(ennemy.mesh.position.clone(), 15, Colors.red, 3);

            ennemiesPool.unshift(this.ennemiesInUse.splice(i, 1)[0]);
            this.mesh.remove(ennemy.mesh);
            game.planeCollisionSpeedX = 100 * diffPos.x / d;
            game.planeCollisionSpeedY = 100 * diffPos.y / d;
            ambientLight.intensity = 2;

            removeEnergy();
            i--;
        } else if (ennemy.angle > Math.PI) {
            ennemiesPool.unshift(this.ennemiesInUse.splice(i, 1)[0]);
            this.mesh.remove(ennemy.mesh);
            i--;
        }
    }
}