import * as THREE from 'three'
import Experience from './Experience.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { CopyShader } from "three/addons/shaders/CopyShader.js"
import gsap from "gsap";

import UnrealBloomPassModifyFragmentShader from './Shaders/UnrealBloomPassModify/fragment.glsl'

import VisionPassVertexShader from './Shaders/VisionPass/vertex.glsl'
import VisionPassFragmentShader from './Shaders/VisionPass/fragment.glsl'

import ColorFilterPassVertexShader from './Shaders/ColorFilterPass/vertex.glsl'
import ColorFilterPassFragmentShader from './Shaders/ColorFilterPass/fragment.glsl'

export default class Renderer
{
    constructor()
    {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.stats = this.experience.debug.stats
        this.debug = this.experience.debug.debug
        this.resources = this.experience.resources
        this.timeline = this.experience.timeline
        this.html = this.experience.html

        this.usePostprocess = true

        this.setInstance()
        this.setPostProcess()
        this.setVision()
        this.setDebug()
    }

    setInstance()
    {
        this.clearColor = '#010101'

        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            powerPreference: "high-performance",
            antialias: false,
            alpha: false,
            // stencil: false,
            // depth: false,
            useLegacyLights: false,
            physicallyCorrectLights: true,
        })

        this.instance.outputColorSpace = THREE.SRGBColorSpace
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))

        this.instance.setClearColor(this.clearColor, 1)
        this.instance.setSize(this.sizes.width, this.sizes.height)
    }


    setPostProcess()
    {
        this.postProcess = {}

        /**
         * Passes
         */
        // Render pass
        this.postProcess.renderPass = new RenderPass(this.scene, this.camera.instance)

        // Bloom pass
        this.postProcess.unrealBloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.sizes.width, this.sizes.height),
            2.286,
            0.190,
            0
        )
        this.postProcess.unrealBloomPass.enabled = true

        this.postProcess.unrealBloomPass.tintColor = {}
        this.postProcess.unrealBloomPass.tintColor.value = '#000000'
        this.postProcess.unrealBloomPass.tintColor.instance = new THREE.Color(this.postProcess.unrealBloomPass.tintColor.value)

        this.postProcess.unrealBloomPass.compositeMaterial.uniforms.uTintColor = { value: this.postProcess.unrealBloomPass.tintColor.instance }
        this.postProcess.unrealBloomPass.compositeMaterial.uniforms.uTintStrength = { value: 0.9 }
        this.postProcess.unrealBloomPass.compositeMaterial.fragmentShader = UnrealBloomPassModifyFragmentShader

        // Vision Pass
        this.postProcess.visionPass = new ShaderPass({
            uniforms: {
                uBloomTexture: { value: null },
                uTargetTexture1: { value: null },
                uTargetTexture2: { value: null },

                time: { type: "f", value: 0 },
                progress: { type: "f", value: 0.0 },
                border: { type: "f", value: 0 },
                intensity: { type: "f", value: 0 },
                scaleX: { type: "f", value: 40 },
                scaleY: { type: "f", value: 40 },
                transition: { type: "f", value: 40 },
                swipe: { type: "f", value: 0 },
                width: { type: "f", value: 0 },
                radius: { type: "f", value: 0 },
                texture1: { type: "f", value: null },
                texture2: { type: "f", value: null },
                displacement: { type: "f", value: null },
                resolution: { type: "v4", value: new THREE.Vector4() },
            },
            vertexShader: VisionPassVertexShader,
            fragmentShader: VisionPassFragmentShader,
        }, 'uBloomTexture')

        // Color Filter Pass
        this.postProcess.colorFilterPass = new ShaderPass({
            uniforms: {
                uDiffuseTexture: { value: null },
            },
            vertexShader: ColorFilterPassVertexShader,
            fragmentShader: ColorFilterPassFragmentShader,
        }, 'uDiffuseTexture')



        /**
         * Effect composer
         */

        this.renderTarget = new THREE.WebGLRenderTarget(
            this.sizes.width,
            this.sizes.height,
            {
                generateMipmaps: false,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                colorSpace: THREE.SRGBColorSpace,
                samples: this.instance.getPixelRatio() === 1 ? 2 : 0,
            }
        )
        this.postProcess.composer = new EffectComposer(this.instance, this.renderTarget)
        this.postProcess.composer.setSize(this.sizes.width, this.sizes.height)
        this.postProcess.composer.setPixelRatio(this.sizes.pixelRatio)

        this.postProcess.composer.addPass(this.postProcess.visionPass)


        // Create a render target buffer Original
        this.renderTargetOriginal = new THREE.WebGLRenderTarget(
            this.sizes.width,
            this.sizes.height,
            {
                generateMipmaps: false,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                colorSpace: THREE.SRGBColorSpace,
                samples: this.instance.getPixelRatio() === 1 ? 2 : 0,
            }
        )

        this.postProcess.composerOriginal = new EffectComposer(this.instance, this.renderTargetOriginal)
        this.postProcess.composerOriginal.renderToScreen = false
        this.postProcess.composerOriginal.setSize(this.sizes.width, this.sizes.height)
        this.postProcess.composerOriginal.setPixelRatio(this.sizes.pixelRatio)

        this.postProcess.composerOriginal.addPass(this.postProcess.renderPass)
        this.postProcess.composerOriginal.addPass(this.postProcess.unrealBloomPass)

        this.renderTargetVision = new THREE.WebGLRenderTarget(
            this.sizes.width,
            this.sizes.height,
            {
                generateMipmaps: false,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                colorSpace: THREE.SRGBColorSpace,
                samples: this.instance.getPixelRatio() === 1 ? 2 : 0,
            }
        )

        this.postProcess.composerVision = new EffectComposer(this.instance, this.renderTargetVision)
        this.postProcess.composerVision.renderToScreen = false
        this.postProcess.composerVision.setSize(this.sizes.width, this.sizes.height)
        this.postProcess.composerVision.setPixelRatio(this.sizes.pixelRatio)

        this.postProcess.composerVision.addPass(this.postProcess.renderPass)
        this.postProcess.composerVision.addPass(this.postProcess.colorFilterPass)
        this.postProcess.composerVision.addPass(this.postProcess.colorFilterPass)
        this.postProcess.composerVision.addPass(new ShaderPass( CopyShader ))

        // set vision texture
        this.postProcess.visionPass.uniforms.uTargetTexture1.value = this.postProcess.composerOriginal.readBuffer.texture
        this.postProcess.visionPass.uniforms.uTargetTexture2.value = this.postProcess.composerVision.readBuffer.texture
    }

    setVision()
    {
        const opts = {
            duration: 0.8,
            easing: 'easeOut',
        }
        this.vision = true;
        this.width = this.sizes.width;
        this.height = this.sizes.height;
        this.duration = opts.duration || 1;
        this.easing = opts.easing || 'easeInOut'
        this.time = 0;
        this.current = 0;
        this.textures = [];
        this.paused = true;

        // set settings
        this.settings = { progress: 0.5 };

        this.resources.on('ready', () => {
            this.postProcess.visionPass.material.uniforms.displacement.value = this.resources.items.displacementTexture;
        })

        // add event listener on press F key code
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyF') {
                this.html.pressF.style.display = 'none';
                if(this.isRunning) return;
                this.isRunning = true;

                //let len = this.textures.length;
                //let nextTexture =this.textures[(this.current +1)%len];
                //this.material.uniforms.texture2.value = nextTexture;

                if (this.vision) {
                    this.postProcess.visionPass.uniforms.uTargetTexture2.value = this.postProcess.composerVision.readBuffer.texture
                }else{
                    this.postProcess.visionPass.uniforms.uTargetTexture2.value = this.postProcess.composerOriginal.readBuffer.texture
                }

                this.timeline = gsap.timeline({});

                this.timeline.to(this.postProcess.visionPass.material.uniforms.progress,
                    {
                        duration: this.duration,
                        ease: 'power2.out',
                        value: 1,
                        onStart:()=> {
                            this.experience.world.sound.visionChangeSound.play()
                        },
                        onComplete:()=> {
                            if (this.vision) {
                                this.postProcess.visionPass.uniforms.uTargetTexture1.value = this.postProcess.composerVision.readBuffer.texture
                            }else{
                                this.postProcess.visionPass.uniforms.uTargetTexture1.value = this.postProcess.composerOriginal.readBuffer.texture
                            }

                            this.postProcess.visionPass.material.uniforms.progress.value = 0;
                            this.isRunning = false;

                            this.vision = !this.vision;
                            this.experience.world.sound.visionChangeSound.stop()
                        },
                    }
                )
            }
        });

    }

    resize()
    {
        // Instance
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))

        // Post process
        this.postProcess.composer.setSize(this.sizes.width, this.sizes.height)
        this.postProcess.composer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))

        this.postProcess.composerOriginal.setSize(this.sizes.width, this.sizes.height)
        this.postProcess.composerOriginal.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))

        this.postProcess.composerVision.setSize(this.sizes.width, this.sizes.height)
        this.postProcess.composerVision.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
    }

    setDebug()
    {
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: 'renderer'
            })

            const debugFolder = this.debugFolder
                .addFolder({
                    title: 'UnrealBloomPass'
                })

            debugFolder
                .addBinding(
                    this.postProcess.unrealBloomPass,
                    'enabled',
                    {  }
                )

            debugFolder
                .addBinding(
                    this.postProcess.unrealBloomPass,
                    'strength',
                    { min: 0, max: 3, step: 0.001 }
                )

            debugFolder
                .addBinding(
                    this.postProcess.unrealBloomPass,
                    'radius',
                    { min: 0, max: 1, step: 0.001 }
                )

            debugFolder
                .addBinding(
                    this.postProcess.unrealBloomPass,
                    'threshold',
                    { min: 0, max: 1, step: 0.001 }
                )

            debugFolder
                .addBinding(
                    this.postProcess.unrealBloomPass.tintColor,
                    'value',
                    { view: 'uTintColor', label: 'color' }
                )
                .on('change', () =>
                {
                    this.postProcess.unrealBloomPass.tintColor.instance.set(this.postProcess.unrealBloomPass.tintColor.value)
                })

            debugFolder
                .addBinding(
                    this.postProcess.unrealBloomPass.compositeMaterial.uniforms.uTintStrength,
                    'value',
                    { label: 'uTintStrength', min: 0, max: 1, step: 0.001 }
                )
        }
    }

    update()
    {
        if(this.usePostprocess)
        {
            this.postProcess.visionPass.material.uniforms.time.value = this.time.elapsed


            if (this.experience.world.text)
                this.experience.world.text.text.visible = false

            this.postProcess.composerOriginal.render()

            if (this.experience.world.text)
                this.experience.world.text.text.visible = true

            this.postProcess.composerVision.render()


            this.postProcess.composer.render()
        }
        else
        {
            this.instance.render(this.scene, this.camera.instance)
        }
    }

    destroy()
    {

    }
}
