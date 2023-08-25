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
