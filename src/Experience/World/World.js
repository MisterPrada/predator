import * as THREE from 'three'

import Experience from '../Experience.js'
import Environment from './Environment.js'

import BlobSphere from './Blob.js'
import Predator from "./Predator.js";

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.camera = this.experience.camera;
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.html = this.experience.html
        this.sound = this.experience.sound
        this.debug = this.experience.debug.debug

        // this.resources.on('ready', () =>
        // {
        //     this.html.preloader.remove();
        //     this.html.playButton.remove();
        //
        //     this.predator = new Predator()
        //     this.environment = new Environment()
        // })

        // Wait for resources
        this.resources.on('ready', () =>
        {
            this.html.playButton.classList.add("fade-in");
            this.html.playButton.addEventListener('click', () => {

                this.html.playButton.classList.replace("fade-in", "fade-out");
                this.sound.createSounds();

                setTimeout(() => {
                    this.experience.time.start = Date.now()
                    this.experience.time.elapsed = 0

                    // Setup
                    // if ( this.debug )
                    //     this.text = new Text()

                    this.predator = new Predator()
                    this.blob = new BlobSphere()
                    this.environment = new Environment()

                    // Remove preloader
                    this.html.preloader.classList.add("preloaded");
                    setTimeout(() => {
                        this.html.preloader.remove();
                        this.html.playButton.remove();
                        this.html.pressF.style.display = "block";
                    }, 2500);

                    // Animation timeline
                    this.animationPipeline();
                }, 100);
            }, { once: true });
        })
    }

    animationPipeline() {
        if ( this.text )
            this.text.animateTextShow()

        if ( this.camera )
            this.camera.animateCameraPosition()
    }

    resize() {

    }

    update()
    {
        if(this.predator)
            this.predator.update()

        if(this.blob)
            this.blob.update()

        if(this.text)
            this.text.update()
    }
}
