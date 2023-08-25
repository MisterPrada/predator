import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from "gsap";

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
        //this.setControls()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(25, this.sizes.width / this.sizes.height, 0.1, 300)
        this.defaultCameraPosition = new THREE.Vector3(-0.5, 1.5, 4);

        this.instance.position.copy(this.defaultCameraPosition)
        this.instance.lookAt(new THREE.Vector3(0, 1.5, 0));

        this.lerpVector.copy(this.instance.position);

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
        if (this.cursorEnabled === true) {
            const lerpTarget = new THREE.Vector3();
            const targetX = this.experience.cursor.x;
            const targetY = 1.5 + this.experience.cursor.y;

            lerpTarget.set(targetX, targetY, this.instance.position.z)

            const lerpFactor = 0.8;  // set speed interpolation

            this.lerpVector.lerp(new THREE.Vector3().copy(lerpTarget), lerpFactor * this.time.delta);

            this.instance.position.copy(this.lerpVector);
        }

        this.instance.lookAt(new THREE.Vector3(0, 1.5, 0));

        //this.controls.update()

        //this.instance.updateMatrixWorld() // To be used in projection
    }

    animateCameraPosition() {
        this.timeline.add(
            gsap.from(this.instance.position, {
                duration: 10,
                ease: "power1.inOut",
                x: .66,
                y: 1.1,
                z: 2.56,
                onStart: () => {
                    setTimeout(() => {
                        this.experience.world.sound.predatorGrowlSound.play()

                        setTimeout(() => {
                            this.experience.world.predator.animation.actions.current.play()
                            this.experience.world.sound.bladesDrawSound.play()
                        }, 900);
                    }, 4000);
                },
                onComplete: () => {
                    this.cursorEnabled = true
                    this.lerpVector.copy(this.instance.position);
                    //console.log("Camera animation finished")
                }
            }),
            "start"
        );
    }
}
