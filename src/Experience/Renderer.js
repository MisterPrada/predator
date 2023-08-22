import * as THREE from 'three'
import Experience from './Experience.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'


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
                varying vec2 vUv;
                void main() {
                    vec4 color = texture2D(uBloomTexture, vUv);
                    
                    color.rgb = mix(color.rgb, vec3(0.0, 0.0, 0.0), 0.5);
                    
                    gl_FragColor = color;
                
                    #include <colorspace_fragment>
               }
           `,
        }, 'uBloomTexture')

        if(this.debug)
        {
            const debugFolder = this.debugFolder
                .addFolder({
                    title: 'UnrealBloomPass'
                })

            debugFolder
                .addInput(
                    this.postProcess.unrealBloomPass,
                    'enabled',
                    {  }
                )

            debugFolder
                .addInput(
                    this.postProcess.unrealBloomPass,
                    'strength',
                    { min: 0, max: 3, step: 0.001 }
                )

            debugFolder
                .addInput(
                    this.postProcess.unrealBloomPass,
                    'radius',
                    { min: 0, max: 1, step: 0.001 }
                )

            debugFolder
                .addInput(
                    this.postProcess.unrealBloomPass,
                    'threshold',
                    { min: 0, max: 1, step: 0.001 }
                )

            debugFolder
                .addInput(
                    this.postProcess.unrealBloomPass.tintColor,
                    'value',
                    { view: 'uTintColor', label: 'color' }
                )
                .on('change', () =>
                {
                    this.postProcess.unrealBloomPass.tintColor.instance.set(this.postProcess.unrealBloomPass.tintColor.value)
                })

            debugFolder
                .addInput(
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


        this.postProcess.composer.addPass(this.postProcess.renderPass)
        this.postProcess.composer.addPass(this.postProcess.unrealBloomPass)
        this.postProcess.composer.addPass(this.postProcess.visionPass)
    }

    setVision()
    {
        const opts = {
            duration: 1.5,
            easing: 'easeOut',
            uniforms: {
                // width: {value: 0.35, type:'f', min:0., max:1},
            },
            fragment: `
		uniform float time;
		uniform float progress;
		uniform float width;
		uniform float scaleX;
		uniform float scaleY;
		uniform float transition;
		uniform float radius;
		uniform float swipe;
		uniform sampler2D texture1;
		uniform sampler2D texture2;
		uniform sampler2D displacement;
		uniform vec4 resolution;

		varying vec2 vUv;
		varying vec4 vPosition;
		vec2 mirrored(vec2 v) {
			vec2 m = mod(v,2.);
			return mix(m,2.0 - m, step(1.0 ,m));
		}

		void main()	{
		  vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
		  vec4 noise = texture2D(displacement, mirrored(newUV+time*0.04));
		  // float prog = 0.6*progress + 0.2 + noise.g * 0.06;
		  float prog = progress*0.8 -0.05 + noise.g * 0.06;
		  float intpl = pow(abs(smoothstep(0., 1., (prog*2. - vUv.x + 0.5))), 10.);
		  
		  vec4 t1 = texture2D( texture1, (newUV - 0.5) * (1.0 - intpl) + 0.5 ) ;
		  vec4 t2 = texture2D( texture2, (newUV - 0.5) * intpl + 0.5 );
		  gl_FragColor = mix( t1, t2, intpl );

		}

	`
        }

        this.fragment = opts.fragment;
        this.uniforms = opts.uniforms;
        this.width = this.sizes.width;
        this.height = this.sizes.height;
        this.duration = opts.duration || 1;
        this.easing = opts.easing || 'easeInOut'
    }

    resize()
    {
        // Instance
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))

        // Post process
        this.postProcess.composer.setSize(this.sizes.width, this.sizes.height)
        this.postProcess.composer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
    }

    update()
    {
        // if(this.stats)
        // {
        //     this.stats.begin()
        // }

        if(this.usePostprocess)
        {
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
