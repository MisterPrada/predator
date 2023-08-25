import * as THREE from 'three'
import Experience from '../Experience.js'
import textVertexShader from '../Shaders/Blob/vertex.glsl'
import textFragmentShader from '../Shaders/Blob/fragment.glsl'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import gsap from "gsap";

export default class BlobSphere {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer.instance

        this.timeline = this.experience.timeline;

        this.setModel()
        this.setDebug()
    }

    setModel(){
        this.theme = {
            primary: 0xFFFFFF,
            secondary: 0x292733,
            danger: 0xFF0000,
            darker: 0x000000
        };

        this._primitive;
        this.start = Date.now();
        this.shapeGroup = new THREE.Group();


        this.mesh = new THREE.Object3D();
        this.mat = new THREE.ShaderMaterial( {
            side:THREE.DoubleSide,
            uniforms: {
                time: {
                    type: "f",
                    value: 0.1
                },
                pointscale: {
                    type: "f",
                    value: 0.2
                },
                decay: {
                    type: "f",
                    value: 0.3
                },
                size: {
                    type: "f",
                    value: 0.3
                },
                displace: {
                    type: "f",
                    value: 0.3
                },
                complex: {
                    type: "f",
                    value: 0.0
                },
                waves: {
                    type: "f",
                    value: 0.10
                },
                eqcolor: {
                    type: "f",
                    value: 0.0
                },
                rcolor: {
                    type: "f",
                    value: 0.0
                },
                gcolor: {
                    type: "f",
                    value: 0.0
                },
                bcolor: {
                    type: "f",
                    value: 0.0
                },
                fragment: {
                    type: "i",
                    value: true
                },
                redhell: {
                    type: "i",
                    value: true
                }
            },
            vertexShader: textVertexShader,
            fragmentShader: textFragmentShader
        });
        //---
        var wir_mat = new THREE.MeshBasicMaterial({color: this.theme.darker});
        var geo = new THREE.SphereGeometry(0.5, 128, 128);
        var wir = new THREE.SphereGeometry(1.0, 32, 32);
        this.shape = new THREE.Mesh(geo, this.mat);
        this.point = new THREE.Points(wir, this.mat);
        //---
        this.shapeGroup.add(this.point);
        this.shapeGroup.add(this.shape);

        this.shapeGroup.position.copy(new THREE.Vector3(-0.11, 2.14, 0.71))
        this.shapeGroup.scale.copy(new THREE.Vector3(0.1, 0.1, 0.1))

        // Add TransformControls
        // var transformControls = new TransformControls(this.camera.instance, this.renderer.domElement);
        // transformControls.attach(this.shapeGroup);
        //
        // transformControls.addEventListener('dragging-changed', (event) => {
        //     this.camera.controls.enabled = !event.value;
        // });
        //
        // this.scene.add(transformControls);

        this.options = {
            perlin: {
                speed: 0.4,
                size: 10.0,
                perlins: 1.0,
                decay: 1.20,
                displace: 0.6,
                complex: 1.0,
                waves: 0.287,
                eqcolor: 9.0,
                rcolor: 0.85,
                gcolor: 0.05,
                bcolor: 0.32,
                fragment: true,
                points: false,
                redhell: false
            },
            perlinRandom: function() {
                gsap.to(this.perlin, 2, {
                    //decay: Math.random() * 1.0,
                    waves: Math.random() * 20.0,
                    complex: Math.random() * 1.0,
                    displace: Math.random() * 2.5,
                    ease: 'power2.inOut'
                });
            },
            random: function() {
                //this.perlin.redhell = Math.random() >= 0.5; // 10 1 0.1 1.2
                gsap.to(this.perlin, 1, {
                    eqcolor: 11.0,
                    rcolor: Math.random() * 1.5,
                    gcolor: Math.random() * 0.5,
                    bcolor: Math.random() * 1.5,
                    ease: 'power2.inOut'
                });
            },
            normal: function() {
                this.perlin.redhell = true; // 10 1 0.1 1.2
                gsap.to(this.perlin, 1, {
                    //speed: 0.12,
                    eqcolor: 10.0,
                    rcolor: 1.5,
                    gcolor: 1.5,
                    bcolor: 1.5,
                    ease: 'power2.inOut'
                });
            },
            darker: function() {
                this.perlin.redhell = false; // 10 1 0.1 1.2
                gsap.to(this.perlin, 1, {
                    //speed: 0.5,
                    eqcolor: 9.0,
                    rcolor: 0.4,
                    gcolor: 0.05,
                    bcolor: 0.6,
                    ease: 'power2.inOut'
                });
            },
            volcano: function() {
                this.perlin.redhell = false; // 10 1 0.1 1.2
                //this.perlin.speed = 0.83;

                gsap.to(this.perlin, 1, {
                    size: 0.7,
                    waves: 0.6,
                    complex: 1.0,
                    displace: 0.3,
                    eqcolor: 9.0,
                    rcolor: 0.85,
                    gcolor: 0.05,
                    bcolor: 0.32,
                    ease: 'power2.inOut'
                });
            },
            cloud: function() {
                this.perlin.redhell = true; // 10 1 0.1 1.2
                //this.perlin.speed = 0.1;

                gsap.to(this.perlin, 1, {
                    size: 1.0,
                    waves :20.0,
                    complex: 0.1,
                    displace: 0.1,
                    eqcolor: 4.0,
                    rcolor: 1.5,
                    gcolor: 0.7,
                    bcolor: 1.5,
                    ease: 'power2.inOut'
                });
            },
            tornasol: function() {
                this.perlin.redhell = true; // 10 1 0.1 1.2
                //this.perlin.speed = 0.25;

                gsap.to(this.perlin, 1, {
                    size: 1.0,
                    waves: 3.0,
                    complex: 0.65,
                    displace: 0.5,
                    eqcolor: 9.5,
                    rcolor: 1.5,
                    gcolor: 1.5,
                    bcolor: 1.5,
                    ease: 'power2.inOut'
                });
            },
            show: function() {
                gsap.to(this.perlin, 6, {
                    size: 1.310,
                    ease: 'power2.inOut'
                });
            },
        }

        this.experience.world.predator.group.add(this.shapeGroup);
    }

    setDebug() {
        if(this.debug)
        {
            const debugFolder = this.debug.addFolder({
                title: 'Blob'
            })


            const btn = debugFolder.addButton({
                title: 'Random',
                label: 'Random Shape',   // optional
            });

            btn.on('click', () => {
                this.options.perlinRandom();
            })


            debugFolder
                .addBinding(
                    this.options.perlin,
                    'speed',
                    { min: 0.1, max: 1.0, step: 0.001, name: "Speed" }
                )

            debugFolder
                .addBinding(
                    this.options.perlin,
                    'size',
                    { min: 0.0, max: 3.0, step: 0.001, name: "Size" }
                )

            debugFolder
                .addBinding(
                    this.options.perlin,
                    'waves',
                    { min: 0.0, max: 20.0, step: 0.001, name: "Waves" }
                )

            debugFolder
                .addBinding(
                    this.options.perlin,
                    'complex',
                    { min: 0.1, max: 1.0, step: 0.001, name: "Complex" }
                )

            debugFolder
                .addBinding(
                    this.options.perlin,
                    'displace',
                    { min: 0.1, max: 2.5, step: 0.001, name: "Displacement" }
                )

            debugFolder.addButton({
                title: 'Random',
                label: 'Random colors',   // optional
            }).on('click', () => {
                this.options.random();
            })

            debugFolder.addButton({
                title: 'Normal',
                label: 'Normal colors',   // optional
            }).on('click', () => {
                this.options.normal();
            })

            debugFolder.addButton({
                title: 'Dark',
                label: 'Dark colors',   // optional
            }).on('click', () => {
                this.options.darker();
            })

            debugFolder
                .addBinding(
                    this.options.perlin,
                    'eqcolor',
                    { min: 0.0, max: 30.0, step: 0.001, name: "Hue" }
                )

            debugFolder
                .addBinding(
                    this.options.perlin,
                    'rcolor',
                    { min: 0.0, max: 2.5, step: 0.001, name: "R" }
                )

            debugFolder
                .addBinding(
                    this.options.perlin,
                    'gcolor',
                    { min: 0.0, max: 2.5, step: 0.001, name: "G" }
                )

            debugFolder
                .addBinding(
                    this.options.perlin,
                    'bcolor',
                    { min: 0.0, max: 2.5, step: 0.001, name: "B" }
                )

            debugFolder
                .addBinding(
                    this.options.perlin,
                    'redhell',
                    { name: "Redhell" }
                )

            debugFolder.addButton({
                title: 'Volcano',
                label: 'Volcano',   // optional
            }).on('click', () => {
                this.options.volcano();
            })

            debugFolder.addButton({
                title: 'Tornasol',
                label: 'Tornasol',   // optional
            }).on('click', () => {
                this.options.tornasol();
            })

            debugFolder.addButton({
                title: 'Cotton Candy',
                label: 'Cotton Candy',   // optional
            }).on('click', () => {
                this.options.cloud();
            })


            debugFolder
                .addBinding(
                    this.options.perlin,
                    'points',
                    { name: "Points" }
                )


            debugFolder
                .addBinding(
                    this.shapeGroup,
                    'position',
                    { name: "Position Blob"}
                )



        }
    }

    update() {
        var performance = Date.now() * 0.003;
        //---
        //_primitive.shape.visible = !options.perlin.points;
        this.point.visible = this.options.perlin.points;
        //---
        this.mat.uniforms['time'].value = (this.options.perlin.speed / 1000) * (Date.now() - this.start);

        this.mat.uniforms['pointscale'].value =    this.options.perlin.perlins;
        this.mat.uniforms['decay'].value =         this.options.perlin.decay;
        this.mat.uniforms['size'].value =          this.options.perlin.size;
        this.mat.uniforms['displace'].value =      this.options.perlin.displace;
        this.mat.uniforms['complex'].value =       this.options.perlin.complex;
        this.mat.uniforms['waves'].value =         this.options.perlin.waves;
        this.mat.uniforms['fragment'].value =      this.options.perlin.fragment;

        this.mat.uniforms['redhell'].value =       this.options.perlin.redhell;
        this.mat.uniforms['eqcolor'].value =       this.options.perlin.eqcolor;
        this.mat.uniforms['rcolor'].value =        this.options.perlin.rcolor;
        this.mat.uniforms['gcolor'].value =        this.options.perlin.gcolor;
        this.mat.uniforms['bcolor'].value =        this.options.perlin.bcolor;
    }
}
