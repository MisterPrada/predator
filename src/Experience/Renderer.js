import * as THREE from 'three'
import Experience from './Experience.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { CopyShader } from "three/addons/shaders/CopyShader.js";
import gsap from "gsap";
import {AdditiveBlending} from "three";


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

        this.usePostprocess = true

        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: 'renderer'
            })
        }

        this.setInstance()
        this.setPostProcess()
        this.setVision()
    }

    setInstance()
    {
        this.clearColor = '#010101'

        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            powerPreference: "high-performance",
            antialias: true,
            alpha: false,
            // stencil: false,
            // depth: false,
            useLegacyLights: false,
            physicallyCorrectLights: true,
        })

        // this.instance.physicallyCorrectLights = true
        //this.instance.outputEncoding = THREE.sRGBEncoding
        //this.instance.outputColorSpace = THREE.LinearSRGBColorSpace
        this.instance.outputColorSpace = THREE.SRGBColorSpace
        //this.instance.toneMapping = THREE.CineonToneMapping
        //this.instance.toneMappingExposure = 0.75
        // this.instance.shadowMap.enabled = true
        // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        //this.instance.setClearColor('#211d20')
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
        this.postProcess.unrealBloomPass.compositeMaterial.fragmentShader = `
varying vec2 vUv;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform sampler2D dirtTexture;
uniform float bloomStrength;
uniform float bloomRadius;
uniform float bloomFactors[NUM_MIPS];
uniform vec3 bloomTintColors[NUM_MIPS];
uniform vec3 uTintColor;
uniform float uTintStrength;

float lerpBloomFactor(const in float factor) {
    float mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, bloomRadius);
}

void main() {
    vec4 color = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
        lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
        lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
        lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
        lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );

    color.rgb = mix(color.rgb, uTintColor, uTintStrength);
    gl_FragColor = color;
}
        `

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
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform sampler2D uBloomTexture;
                uniform sampler2D uTargetTexture1;
                uniform sampler2D uTargetTexture2;
                varying vec2 vUv;
                
                
                uniform float time;
                uniform float progress;
                uniform float width;
                uniform float scaleX;
                uniform float scaleY;
                uniform float transition;
                uniform float radius;
                uniform float swipe;
                uniform sampler2D displacement;
                uniform vec4 resolution;
        
                varying vec4 vPosition;
                
                vec2 mirrored(vec2 v) {
                    vec2 m = mod(v,2.);
                    return mix(m,2.0 - m, step(1.0 ,m));
                }
                
                void main() {
                    //colorTexture1.rgb = mix(colorTexture1.rgb, vec3(0.0, 0.0, 0.0), 0.5);
                    
                    vec2 newUV = (vUv - vec2(0.5)) + vec2(0.5);
                    vec4 noise = texture2D(displacement, mirrored(newUV+time*0.04));
                    float prog = progress*0.8 -0.05 + noise.g * 0.06;
                    float intpl = pow(abs(smoothstep(0., 1., (prog*2. - vUv.x + 0.5))), 10.);
                    vec4 t1 = texture2D( uTargetTexture1, (newUV - 0.5) * (1.0 - intpl) + 0.5 ) ;
                    vec4 t2 = texture2D( uTargetTexture2, (newUV - 0.5) * intpl + 0.5 );
                    
                    gl_FragColor = mix( t1, t2, intpl );
                    
                    #include <colorspace_fragment>
               }
           `,
        }, 'uBloomTexture')

        // Color Filter Pass
        this.postProcess.colorFilterPass = new ShaderPass({
            uniforms: {
                uDiffuseTexture: { value: null },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D uDiffuseTexture;
                
                void main() {
                    vec4 colorTexture = texture2D(uDiffuseTexture, vUv);
                    
                    // Predator Vision
                    float r = colorTexture.r;
                    float g = colorTexture.g;
                    float b = colorTexture.b;
                    float a = colorTexture.a;
                    
                    float luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    
                    float visionIntensity = 0.9;
                    float visionThreshold = 0.01;
                    
                    if(luminance > visionThreshold)
                    {
                        colorTexture.r = visionIntensity;
                        colorTexture.g = visionIntensity;
                        colorTexture.b = visionIntensity;
                    }
                    
                    
                    float increasedBrightness = 0.1;
    
                    //increase brightness by ten percent (multiply by current brightness plus extra)
                    colorTexture *= (1.0 + increasedBrightness);
                    colorTexture += vec4(0.0, 0.0, 0.0, 0.0);
                    
                    if (colorTexture.r >= 0.002 && colorTexture.g >= 0.002 && colorTexture.b >= 0.002)
                    {
                       //colorTexture.r += 1.0;
                       colorTexture.b -= 0.94;
                       colorTexture.g -= 0.94;
                    }
                    else if ((colorTexture.r >= 0.4 && colorTexture.r < 0.6) && (colorTexture.g >= 0.4 && colorTexture.g < 0.6) && (colorTexture.b >= 0.4 && colorTexture.b < 0.6))
                    {
                       // colorTexture.g += 0.5;   
                       // colorTexture.b -= 0.1;
                       colorTexture.r += 0.3;
                       
                       discard;
                    }
                    else if ((colorTexture.r >= 0.3 && colorTexture.r < 0.4) && (colorTexture.g >= 0.3 && colorTexture.g < 0.4) && (colorTexture.b >= 0.3 && colorTexture.b < 0.4))
                    {
                       colorTexture.g += 0.6;
                       discard;
                    }
                    else
                    {
                        colorTexture.b += 1.2;
                    }
                    
                    
                    gl_FragColor = colorTexture;
                    
                    #include <colorspace_fragment>
               }
           `,
        }, 'uDiffuseTexture')



        if(this.debug)
        {
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


        //this.postProcess.composer.addPass(this.postProcess.renderPass)
        //this.postProcess.composer.addPass(this.postProcess.unrealBloomPass)
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
                            console.log('FINISH');

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

    update()
    {
        // if(this.stats)
        // {
        //     this.stats.begin()
        // }

        if(this.usePostprocess)
        {
            this.postProcess.visionPass.material.uniforms.time.value = this.time.elapsed

            this.postProcess.composerOriginal.render()

            this.postProcess.composerVision.render()

            this.postProcess.composer.render()
        }
        else
        {
            this.instance.render(this.scene, this.camera.instance)
        }

        // if(this.stats)
        // {
        //     this.stats.end()
        // }
    }

    destroy()
    {
        this.instance.renderLists.dispose()
        this.instance.dispose()
        this.renderTarget.dispose()
        this.postProcess.composer.renderTarget1.dispose()
        this.postProcess.composer.renderTarget2.dispose()
    }
}
