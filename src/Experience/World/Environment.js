import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.scene.colorSpace = THREE.SRGBColorSpace

        //this.setAmbientLight()

        this.setModel()
        this.setDebug()
    }

    setModel() {
        this.env = {}
        this.env.resource = this.experience.resources.items.envModel
        this.env.model = this.env.resource.scene
        //this.env.model.position.copy(new THREE.Vector3(1, 0, 1))
        //this.env.model.scale.set(0.53, 0.53, 0.53)
        //this.env.model.rotation.y = -Math.PI / 3

        this.scene.add(this.env.model)
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight('#ffffff', 0.05)
        this.scene.add(this.ambientLight)
    }


    setEnvironmentMap()
    {

    }

    setDebug() {
        if(this.debug.active) {
            // this.debugFolder = this.debug.ui.addFolder('Environment')
            // this.debugFolder.addColor(this.ambientLight, 'color').name('Color')
            // this.debugFolder.add(this.ambientLight, 'intensity').min(0).max(10).step(0.01).name('Intensity')
        }
    }
}
