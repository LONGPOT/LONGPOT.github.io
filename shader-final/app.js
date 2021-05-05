/*

GENERATIVE ABSTRACT BACKGROUND PROOF-OF-CONCEPT
based on https://github.com/spite/polygon-shredder by Jaume Sanchez

@author Vladimir V. KUCHINOV
@helloworld@vkuchinov.co.uk

*/

var config = {
    camera: new THREE.Vector3(0, 0, -5),
    //background: "#FBE8BF",
    colors: ["#3A617D", "#99B9BD", "#969CA0", "#99B9BD"]
};
var config2 = {
    camera: new THREE.Vector3(0, 0, -5),
    //background: "#FBE8BF",
    colors: ["#F0F4ED", "#FD7D7E", "#F1DCC3", "#C71521"]
};



var pointGLSL;

var scale = 0, nScale = 1;

var params = {

    type: 2,
    spread: 4,
    factor: .5,
    evolution: .5,
    rotation: .5,
    radius: 2,
    pulsate: false,
    scaleX: 1.0,
    scaleY: 1.0,
    scaleZ: 1.0,
    scale: 1.0

};

var blob = "Rectangle.png";
var t = new THREE.Clock();
var m = new THREE.Matrix4();
var v = new THREE.Vector3();
var offset = 0;
var nOffset = new THREE.Vector3(0, 0, 0);
var tmpVector = new THREE.Vector3();

var isMobile = false;
var current = "intro", renderer, scene, camera, controls, curlNoiseModel, particles, particleGLSL, pointGLSL, points, shadowParticleGLSL, shadowCamera, shadowBuffer, shadowBufferSize = 128;
var diffuseData, diffuseTexture, light, encasing;

function CurlNoise(renderer_, width_, height_) {

    this.width = width_;
    this.height = height_;
    this.renderer = renderer_;
    this.targetPos = 0;

    this.data = new Float32Array(this.width * this.height * 4);

    var r = 1;
    for (var i = 0, l = this.width * this.height; i < l; i++) {

        var phi = Math.random() * 2 * Math.PI;
        var costheta = Math.random() * 2 - 1;
        var theta = Math.acos(costheta);
        r = .85 + .15 * Math.random();

        this.data[i * 4] = r * Math.sin(theta) * Math.cos(phi);
        this.data[i * 4 + 1] = r * Math.sin(theta) * Math.sin(phi);
        this.data[i * 4 + 2] = r * Math.cos(theta);
        this.data[i * 4 + 3] = Math.random() * 100; // frames life

    }

    var floatType = isMobile ? THREE.HalfFloatType : THREE.FloatType;

    this.texture = new THREE.DataTexture(this.data, this.width, this.height, THREE.RGBAFormat, THREE.FloatType);
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.needsUpdate = true;

    this.rtTexturePos = new THREE.WebGLRenderTarget(this.width, this.height, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: floatType,
        stencilBuffer: false,
        depthBuffer: false,
        generateMipmaps: false
    });

    this.targets = [this.rtTexturePos, this.rtTexturePos.clone()];

    this.simulationShader = new THREE.ShaderMaterial({

        uniforms: {
            active: { type: 'f', value: 1 },
            width: { type: "f", value: this.width },
            height: { type: "f", value: this.height },
            oPositions: { type: "t", value: this.texture },
            tPositions: { type: "t", value: null },
            timer: { type: "f", value: 0 },
            delta: { type: "f", value: 0 },
            speed: { type: "f", value: .5 },
            reset: { type: 'f', value: 0 },
            offset: { type: 'v3', value: new THREE.Vector3(0, 0, 0) },
            genScale: { type: 'f', value: 1 },
            factor: { type: 'f', value: .5 },
            evolution: { type: 'f', value: .5 },
            inverseModelViewMatrix: { type: 'm4', value: new THREE.Matrix4() },
            radius: { type: 'f', value: 2 }
        },

        vertexShader: document.getElementById('texture_vertex_simulation_shader').textContent,
        fragmentShader: document.getElementById('texture_fragment_simulation_shader').textContent,
        side: THREE.DoubleSide

    });

    this.simulationShader.uniforms.tPositions.value = this.texture;


    this.rtScene = new THREE.Scene();
    this.rtCamera = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, -this.height / 2, this.height / 2, -500, 1000);
    this.rtQuad = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(this.width, this.height),
        this.simulationShader
    );

    this.rtScene.add(this.rtQuad);

    this.renderer.setRenderTarget(this.rtTexturePos)
    this.renderer.render(this.rtScene, this.rtCamera);
    this.renderer.setRenderTarget(null);

    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(64, 64), new THREE.MeshBasicMaterial({ map: this.rtTexturePos.texture, side: THREE.DoubleSide }));

}

CurlNoise.prototype.render = function (time_, delta_) {

    this.simulationShader.uniforms.timer.value = time_;
    this.simulationShader.uniforms.delta.value = delta_;

    this.simulationShader.uniforms.tPositions.value = this.targets[this.targetPos].texture;
    this.targetPos = 1 - this.targetPos;
    this.renderer.setRenderTarget(this.targets[this.targetPos]);
    this.renderer.render(this.rtScene, this.rtCamera);
    this.renderer.setRenderTarget(null);

}

inits();

function inits() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();


    //scene.add(backgroundMesh);

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(config.camera.x, config.camera.y, config.camera.z);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false;

    var s = 15;
    shadowCamera = new THREE.OrthographicCamera(-s, s, s, -s, .1, 20);
    shadowCamera.position.set(10, 4, 10);
    shadowCamera.lookAt(scene.position);

    shadowBuffer = new THREE.WebGLRenderTarget(shadowBufferSize, shadowBufferSize, {

        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: isMobile.any ? THREE.NearestFilter : THREE.LinearMipMapLinear,
        magFilter: isMobile.any ? THREE.NearestFilter : THREE.LinearFilter,
        format: THREE.RGBAFormat

    });

    curlNoiseModel = new CurlNoise(renderer, shadowBufferSize, shadowBufferSize);

    particles = new THREE.Object3D();
    //scene.add(particles);

    var N = shadowBufferSize * shadowBufferSize * 3, vertices = [], colors = [], colors2 = [];

    for (let i = 0; i < N; i += 3) {

        vertices.push(...[0.0, 0.0, 0.0]);

        var c = new THREE.Color(interpolateColors(i / 3, N / 3));
        var c2 = new THREE.Color(interpolateColors2(i / 3, N / 3));
        colors.push(...[c.r, c.g, c.b]);
        colors2.push(...[c2.r, c2.g, c2.b]);

    }

    var inUVs = [];

    for (var x = 0; x < shadowBufferSize; x++) {
        for (var y = 0; y < shadowBufferSize; y++) {

            inUVs.push(remapFloat(x, 0, shadowBufferSize, 0.0, 1.0));
            inUVs.push(remapFloat(y, 0, shadowBufferSize, 0.0, 1.0));

        }
    }

    var pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(vertices), 3));
    pointsGeometry.addAttribute("inUV", new THREE.BufferAttribute(new Float32Array(inUVs), 2));
    pointsGeometry.addAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
    pointsGeometry.addAttribute("color2", new THREE.BufferAttribute(new Float32Array(colors2), 3));

    pointGLSL = new THREE.ShaderMaterial({

        uniforms: {

            blob: {

                type: "t",
                value: new THREE.TextureLoader().load(blob)

            },

            updatedPosition: {

                type: "t",
                value: curlNoiseModel.rtTexturePos.texture

            },
            size: {

                type: "f",
                value: 0.3

            },
            scale: {

                value: window.innerHeight / 2

            },
            offset: {
                value: 0.0
            }
        },
        vertexShader: document.getElementById('vs-points').textContent,
        fragmentShader: document.getElementById('fs-points').textContent,
        transparent: true,
        depthTest: true,
        alphaTest: 0.9


    });

    //pointGLSL.extensions.fragDepth = true;
    //pointGLSL.extensions.drawBuffers = true;


    points = new THREE.Points(pointsGeometry, pointGLSL);
    scene.add(points);

    window.addEventListener('resize', onWindowResize, false);

    animate();

}

function animate() {
    pointGLSL.uniforms.offset.value = offset;

    controls.update();

    scale += (nScale - scale) * .1;

    var delta = t.getDelta() * 10;
    var time = t.elapsedTime;

    var r = 3;
    nOffset.set(r * Math.sin(time), r * Math.cos(.9 * time), 0);

    tmpVector.copy(nOffset);
    tmpVector.sub(curlNoiseModel.simulationShader.uniforms.offset.value);
    tmpVector.multiplyScalar(.1);
    curlNoiseModel.simulationShader.uniforms.offset.value.add(tmpVector);
    curlNoiseModel.simulationShader.uniforms.factor.value = params.factor;
    curlNoiseModel.simulationShader.uniforms.evolution.value = params.evolution;
    curlNoiseModel.simulationShader.uniforms.radius.value = params.pulsate ? (.5 + .5 * Math.cos(time)) * params.radius : params.radius;

    if (curlNoiseModel.simulationShader.uniforms.active.value) { particles.rotation.y = params.rotation * time; }

    m.copy(particles.matrixWorld);
    curlNoiseModel.simulationShader.uniforms.inverseModelViewMatrix.value.getInverse(m);
    curlNoiseModel.simulationShader.uniforms.genScale.value = scale;

    if (curlNoiseModel.simulationShader.uniforms.active.value === 1) { curlNoiseModel.render(time, delta); }

    points.material.uniforms.updatedPosition.value = curlNoiseModel.targets[curlNoiseModel.targetPos].texture;

    renderer.setClearColor(0);
    particles.material = shadowParticleGLSL;

    renderer.setRenderTarget(shadowBuffer);
    renderer.render(scene, shadowCamera);
    renderer.setRenderTarget(null);

    tmpVector.copy(scene.position);
    tmpVector.sub(shadowCamera.position);
    tmpVector.normalize();

    m.makeRotationY(-particles.rotation.y);
    v.copy(shadowCamera.position);
    v.applyMatrix4(m);


    renderer.setClearColor(0xffffff, 0);

    if (offset < 0.5) {
        $(document.body).removeClass('colorTwo');
        $(document.body).addClass('colorOne');

    } else if (offset >= 0.5) {
        $(document.body).removeClass('colorOne');
        $(document.body).addClass('colorTwo');

    };


    renderer.render(scene, camera);

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function interpolateColors(i_, n_) {

    var colorPosition = remapFloat(i_, 0, n_, 0, 3);
    var startColor = Math.floor(colorPosition);
    var endColor = Math.ceil(colorPosition);
    var t = colorPosition - startColor;

    return lerpHexColors(config.colors[startColor], config.colors[endColor], t);

}

function interpolateColors2(i_, n_) {

    var colorPosition = remapFloat(i_, 0, n_, 0, 3);
    var startColor = Math.floor(colorPosition);
    var endColor = Math.ceil(colorPosition);
    var t = colorPosition - startColor;

    return lerpHexColors(config2.colors[startColor], config2.colors[endColor], t);

}

function lerpHexColors(hex0_, hex1_, t_) {

    var ah = parseInt(hex0_.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(hex1_.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + t_ * (br - ar),
        rg = ag + t_ * (bg - ag),
        rb = ab + t_ * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);

}

function remapFloat(v_, min0_, max0_, min1_, max1_) { return min1_ + (v_ - min0_) / (max0_ - min0_) * (max1_ - min1_); }

function hexToRGB(hex_) {

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex_);
    return result ? {

        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255

    } : null;

}



$(document).ready(function () {


    var track1 = document.getElementById("audio1");
    var track2 = document.getElementById("audio2");


    var scrolling = false;
    $(document).click(function () {
        console.log("hover and play");
        track1.play();
        track2.play();
        track2.muted = true;

    });



    $(document).on("mousewheel DOMMouseScroll", function (e) {
        if (scrolling) return;
        if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
            if (offset < 1) {
                // console.log("scroll down");
                offset = offset + 0.014;
            }
            track2.muted = false;
            track1.muted = true;
        } else {
            if (offset > 0) {
                // console.log("scroll up");
                offset = offset - 0.014;

            }
            track1.muted = false;
            track2.muted = true;
        }
        // console.log("offset=" + offset);
    });

});




