varying float qnoise;
varying float noise;

uniform float time;
uniform bool redhell;
uniform float rcolor;
uniform float gcolor;
uniform float bcolor;

void main() {
    float r, g, b;

    if (!redhell == true) {
        r = sin(qnoise + rcolor);
        g = normalize(qnoise + (gcolor / 2.0));
        b = tan(qnoise + bcolor);
    } else {
        r = normalize(qnoise + rcolor);
        g = cos(qnoise + gcolor);
        b = sin(qnoise + bcolor);
    }
    gl_FragColor = vec4(r, g, b, 1.0);
}
