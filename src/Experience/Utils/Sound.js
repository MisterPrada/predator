import * as THREE from 'three'
import EventEmitter from './EventEmitter.js'
import Experience from '../Experience.js'

export default class Sound extends EventEmitter
{
    constructor()
    {
        super()

        this.experience = new Experience()
        this.camera = this.experience.camera.instance
        this.resources = this.experience.resources
        this.renderer = this.experience.renderer.instance
        this.debug = this.experience.debug.debug
        this.sizes = this.experience.sizes

        this.soundsCreated = false;

    }

    isTabVisible() {
        return document.visibilityState === "visible";
    }

    handleVisibilityChange() {
        if (this.isTabVisible()) {
            this.backgroundSound.play();
            this.listener.setMasterVolume(1)
        } else {
            this.backgroundSound.pause();
            this.listener.setMasterVolume(0)
        }
    }

    createSounds() {
        if ( this.soundsCreated === true )
            return


        this.listener = new THREE.AudioListener();
        this.camera.add( this.listener );

        this.backgroundSound = new THREE.Audio( this.listener );
        this.backgroundSound.setBuffer( this.resources.items.backgroundSound );
        this.backgroundSound.setLoop( true );
        this.backgroundSound.setVolume( 0.8 );
        this.backgroundSound.play();

        this.bladesDrawSound = new THREE.Audio( this.listener );
        this.bladesDrawSound.setBuffer( this.resources.items.bladesDrawSound );
        this.bladesDrawSound.setLoop( false );
        this.bladesDrawSound.setVolume( 1.2 );

        this.predatorVoiceSound = new THREE.Audio( this.listener );
        this.predatorVoiceSound.setBuffer( this.resources.items.predatorVoiceSound );
        this.predatorVoiceSound.setLoop( false );
        this.predatorVoiceSound.setVolume( 1.2 );

        this.predatorGrowlSound = new THREE.Audio( this.listener );
        this.predatorGrowlSound.setBuffer( this.resources.items.predatorGrowlSound );
        this.predatorGrowlSound.setLoop( false );
        this.predatorGrowlSound.setVolume( 1.2 );

        this.visionChangeSound = new THREE.Audio( this.listener );
        this.visionChangeSound.setBuffer( this.resources.items.visionChangeSound );
        this.visionChangeSound.setLoop( false );
        this.visionChangeSound.setVolume( 1.2 );

        setInterval(() => {
            this.predatorVoiceSound.play();
        }, 13000);


        this.soundsCreated = true;


        document.addEventListener('visibilitychange', () => this.handleVisibilityChange(), false);

        // window.addEventListener('blur', () => this.backgroundSound.pause());
        // window.addEventListener('focus', () => {
        //     if (isTabVisible()) {
        //         this.backgroundSound.play();
        //     }
        // });

    }

    update() {

    }

    resize() {

    }

}
