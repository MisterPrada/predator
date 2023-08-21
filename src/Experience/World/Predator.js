import * as THREE from 'three'
import Experience from '../Experience'


export default class Predator {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug.debug
        this.resources = this.experience.resources


        // add ambient light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        this.scene.add(this.ambientLight)

        // add directional light
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
        this.directionalLight.position.set(2, 2, 2)
        this.scene.add(this.directionalLight)
        this.group = new THREE.Group()
        this.group.position.copy(new THREE.Vector3(-0.3, -0.2, 0))

        this.setModel()
        this.setModel2()

        this.scene.add(this.group)
    }

    setModel() {
        this.predator = {}
        this.predator.model = this.experience.resources.items.predatorModel.scene
        this.predator.model.position.copy(new THREE.Vector3(1, 0, 1))
        this.predator.model.scale.set(0.53, 0.53, 0.53)
        this.predator.model.rotation.y = -Math.PI / 3

        this.group.add(this.predator.model)
    }

    setModel2() {
        this.predator2 = {}
        this.predator2.model = this.experience.resources.items.predator2Model.scene

        this.predator2.model.position.copy(new THREE.Vector3(-1, -0.9, 0))
        this.predator2.model.scale.set(0.1, 0.1, 0.1)
        this.predator2.model.rotation.y = -Math.PI / 8

        this.predator2.model.traverse((child) => {
            if (child.isMesh && child.name === 'model_9') {
                this.predator2.laser = child

                this.predator2.laser.material.alphaHash = true
                this.predator2.laser.material.map.generateMipmaps = false
                this.predator2.laser.material.map.magFilter = THREE.NearestFilter
                this.predator2.laser.material.map.minFilter = THREE.NearestFilter
            }
        })

        this.group.add(this.predator2.model)
    }

    update() {

    }
}
