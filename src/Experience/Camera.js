import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from "gsap";
import {log} from "three/nodes";

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.canvas = this.experience.canvas
        this.timeline = this.experience.timeline
        this.cursorEnabled = false

        this.lerpVector = new THREE.Vector3();

        this.setInstance()
        this.setControls()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(25, this.sizes.width / this.sizes.height, 0.1, 300)
        //const defaultCameraPosition = new THREE.Vector3(0.0, -100.0, 0.0);
        //const defaultCameraPosition = new THREE.Vector3(10.0, 20.0, -200);
        this.defaultCameraPosition = new THREE.Vector3(-0.5, 1.5, 4);

        this.instance.position.copy(this.defaultCameraPosition)
        //this.instance.rotation.reorder('YXZ')

        //this.lerpVector.copy(this.instance.position);

        this.scene.add(this.instance)
    }

    setControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        this.controls.minDistance = 0;
        this.controls.maxDistance = 500;
        this.controls.enabled = true;
        this.controls.target = new THREE.Vector3(0, 1.5, 0);

        // this.controls.mouseButtons = {
        //     LEFT: THREE.MOUSE.ROTATE,
        //     MIDDLE: null,
        //     RIGHT: null,  // Это отключает действие для правой кнопки мыши
        // };
        //
        // this.controls.enableZoom = false;
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {

        this.controls.update()

        this.instance.updateMatrixWorld() // To be used in projection
    }

    animateCameraPosition() {
        this.timeline.add(
            gsap.to(this.instance.position, {
                duration: 15,
                motionPath: {
                    path: [
                        {x: this.defaultCameraPosition.x, y: this.defaultCameraPosition.y, z: this.defaultCameraPosition.z},
                        {x: 0, y: 9, z: 6},
                        {x: 10, y: 0, z: -5},
                        {x: -5, y: -0.6, z: 5},
                        {x:-3.538882051743628, y: -0.6302885276790784, z: 6.796678438539777},
                    ]
                },
                ease: "power1.inOut",
                onUpdate: () => {
                },
                onComplete: () => {
                    this.controls.mouseButtons = {
                        LEFT: THREE.MOUSE.ROTATE,
                        MIDDLE: null,
                        RIGHT: null  // Это отключает действие для правой кнопки мыши
                    };
                    this.controls.enableZoom = false;

                    this.controls.minPolarAngle = 0.5;  // небольшое ограничение сверху
                    this.controls.maxPolarAngle = Math.PI - 0.8;  // небольшое ограничение снизу
                }
            }),
            "start"
        );


        // this.timeline.add(
        //     gsap.from(this.instance.position, {
        //         duration: 13,
        //         x: 10.0,
        //         y: 15.0,
        //         z: 15.0,
        //         ease: "power1.inOut",
        //         onComplete: () => {
        //
        //         }
        //     }),
        //     "start"
        // )
    }
}
