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
