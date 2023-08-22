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


        this.fftSize = 256;
        this.format = ( this.renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;

        this.volume = 0
        this.levels = []

        // if(this.debug)
        // {
        //     this.setSpectrum()
        // }
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

        this.floatTimeDomainData = new Float32Array(this.fftSize)
        this.byteFrequencyData = new Uint8Array(this.fftSize)

        this.listener = new THREE.AudioListener();
        this.camera.add( this.listener );

        this.backgroundSound = new THREE.Audio( this.listener );
        this.backgroundSound.setBuffer( this.resources.items.backgroundSound );
        this.backgroundSound.setLoop( true );
        this.backgroundSound.setVolume( 0.8 );
        this.backgroundSound.play();

        // create an AudioAnalyser, passing in the sound and desired fftSize
        this.backgroundSoundAnalyser = new THREE.AudioAnalyser( this.backgroundSound, this.fftSize );
        //this.audioTexture = new THREE.DataTexture( this.backgroundSoundAnalyser.data, this.fftSize / 2, 1, this.format );

        this.soundsCreated = true;


        document.addEventListener('visibilitychange', () => this.handleVisibilityChange(), false);

        // window.addEventListener('blur', () => this.backgroundSound.pause());
        // window.addEventListener('focus', () => {
        //     if (isTabVisible()) {
        //         this.backgroundSound.play();
        //     }
        // });

    }

    setSpectrum()
    {
        this.spectrum = {}

        this.spectrum.width = this.fftSize
        this.spectrum.height = 256
        this.spectrum.halfHeight = Math.round(this.spectrum.height * 0.5)

        this.spectrum.canvas = document.createElement('canvas')
        this.spectrum.canvas.width = this.sizes.width
        this.spectrum.canvas.height = this.spectrum.height
        this.spectrum.canvas.style.position = 'fixed'
        this.spectrum.canvas.style.left = 0
        this.spectrum.canvas.style.bottom = 0
        document.body.append(this.spectrum.canvas)

        this.spectrum.context = this.spectrum.canvas.getContext('2d')
        this.spectrum.context.fillStyle = '#ffffff'

        this.spectrum.update = () =>
        {
            this.spectrum.context.clearRect(0, 0, this.sizes.width, this.spectrum.height)

            for(let i = 0; i < this.fftSize; i++)
            {
                const floatTimeDomainValue = this.floatTimeDomainData[i]
                const byteFrequencyValue = this.byteFrequencyData[i]
                const normalizeByteFrequencyValue = byteFrequencyValue / 355

                const x = i * this.sizes.width * 0.75 / this.fftSize
                const y = this.spectrum.height - (normalizeByteFrequencyValue * this.spectrum.height)
                const width = 4
                // const height = floatTimeDomainValue * this.spectrum.height
                const height = normalizeByteFrequencyValue * this.spectrum.height

                this.spectrum.context.fillRect(x, y, width, height)
                this.spectrum.context.fillRect( this.sizes.width - x, y, width, height)
            }
        }
    }

    getLevels()
    {
        const bufferLength = this.fftSize
        const levelCount = 8
        const levelBins = Math.floor(bufferLength / levelCount)

        const levels = []
        let max = 0

        for(let i = 0; i < levelCount; i++)
        {
            let sum = 0

            for(let j = 0; j < levelBins; j++)
            {
                sum +=  this.byteFrequencyData[(i * levelBins) + j]
            }

            const value = sum / levelBins / 256
            levels[i] = value

            if(value > max)
                max = value
        }

        return levels
    }

    getVolume()
    {
        let sumSquares = 0.0
        for(const amplitude of this.floatTimeDomainData)
        {
            sumSquares += amplitude * amplitude
        }

        return Math.sqrt(sumSquares / this.floatTimeDomainData.length)
    }

    update() {
        // if ( this.soundsCreated === false )
        //     return
        //this.backgroundSoundAnalyser.getFrequencyData();
        //this.audioTexture.needsUpdate = true;

        if(!this.soundsCreated)
            return

        // Retrieve audio data
        this.backgroundSoundAnalyser.analyser.getByteFrequencyData(this.byteFrequencyData)
        this.backgroundSoundAnalyser.analyser.getFloatTimeDomainData(this.floatTimeDomainData)

        this.volume = this.getVolume()
        this.levels = this.getLevels()

        // Spectrum
        if(this.spectrum)
            this.spectrum.update()
    }

    resize() {
        this.spectrum.canvas.width = this.sizes.width
        this.spectrum.context.fillStyle = '#ffffff'
    }

}
