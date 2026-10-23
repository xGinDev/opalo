// GLSL for the profile background. Everything is computed in clip space ([-1, 1]),
// so no camera math is needed and the canvas always covers its container.

export const FULLSCREEN_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Soft lights that drift slowly (Figma 9:603 "Fondo": six blurred ellipses + vignette).
 * uWarm / uAccent / uCool come from the profile's accent color.
 */
export const BLOBS_FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform vec3 uAccent;
  uniform vec3 uWarm;
  uniform vec3 uCool;
  uniform vec3 uDarkAccent;
  uniform vec3 uDarkWarm;
  uniform vec3 uDarkCool;

  // Distances in units of the shorter side, so lights keep their size on portrait screens.
  float blob(vec2 p, vec2 c, float r) {
    vec2 d = (p - c) * vec2(max(uAspect, 1.0), max(1.0 / uAspect, 1.0));
    return exp(-dot(d, d) / (r * r));
  }

  // Hash noise to break gradient banding.
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec2 p = vUv;
    float t = uTime * 0.06;
    vec3 col = vec3(0.043, 0.031, 0.071);

    col += uDarkWarm   * 0.85 * blob(p, vec2(0.25 + 0.05 * sin(t * 1.1), 0.70 + 0.04 * cos(t * 0.9)), 0.48);
    col += uDarkAccent * 0.85 * blob(p, vec2(0.82 + 0.04 * cos(t * 0.8), 0.42 + 0.05 * sin(t * 1.2)), 0.50);
    col += uDarkCool   * 0.85 * blob(p, vec2(0.30 + 0.06 * sin(t * 0.7), 0.07 + 0.04 * cos(t * 1.3)), 0.40);
    col += uWarm   * 0.16 * blob(p, vec2(0.80 + 0.05 * cos(t * 1.4), 0.16 + 0.05 * sin(t)), 0.22);
    col += uAccent * 0.20 * blob(p, vec2(0.35 + 0.06 * sin(t * 1.5), 0.56 + 0.05 * cos(t * 1.1)), 0.20);
    col += vec3(0.95, 0.83, 0.61) * 0.10 * blob(p, vec2(0.92 + 0.03 * sin(t), 0.89), 0.17);

    // Vignette
    vec2 v = (p - 0.5) * vec2(uAspect, 1.0);
    col *= mix(1.0, 0.35, smoothstep(0.35, 1.1, length(v) / max(uAspect, 1.0) * 1.4));

    col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Shared particle attributes: aSeed (x, y, size, speed) and aPhase. */
const PARTICLE_HEADER = /* glsl */ `
  attribute vec4 aSeed;
  attribute float aPhase;
  uniform float uTime;
  uniform float uAspect;
  uniform float uPixelRatio;
  varying float vAlpha;
  float wrap(float v) { return mod(v + 1.0, 2.0) - 1.0; }
`;

export const STARS_VERTEX = /* glsl */ `
  ${PARTICLE_HEADER}
  void main() {
    float x = aSeed.x;
    float y = wrap(aSeed.y + uTime * aSeed.w * 0.015);
    vAlpha = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.8 + aSeed.w) + aPhase));
    gl_PointSize = aSeed.z * uPixelRatio;
    gl_Position = vec4(x, y, 0.0, 1.0);
  }
`;

export const SNOW_VERTEX = /* glsl */ `
  ${PARTICLE_HEADER}
  void main() {
    float y = wrap(aSeed.y - uTime * (0.05 + aSeed.w * 0.06));
    float x = aSeed.x + sin(uTime * (0.6 + aSeed.w) + aPhase) * 0.03 / uAspect;
    vAlpha = 0.45 + 0.4 * aSeed.w;
    gl_PointSize = (aSeed.z + 1.5) * uPixelRatio;
    gl_Position = vec4(x, y, 0.0, 1.0);
  }
`;

export const ROUND_POINT_FRAGMENT = /* glsl */ `
  precision mediump float;
  varying float vAlpha;
  uniform vec3 uColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

/** Rain: line segments; aEnd = 0 for the head, 1 for the tail. Slanted ~8° like the Figma. */
export const RAIN_VERTEX = /* glsl */ `
  ${PARTICLE_HEADER}
  attribute float aEnd;
  void main() {
    float speed = 0.9 + aSeed.w * 0.9;
    float len = 0.02 + aSeed.z * 0.012;
    float y = wrap(aSeed.y - uTime * speed);
    float x = aSeed.x + (y + 1.0) * 0.07 / uAspect;
    y += aEnd * len;
    x += aEnd * len * 0.14 / uAspect;
    vAlpha = (0.12 + 0.3 * aSeed.w) * (1.0 - aEnd * 0.6);
    gl_Position = vec4(x, y, 0.0, 1.0);
  }
`;

export const FLAT_FRAGMENT = /* glsl */ `
  precision mediump float;
  varying float vAlpha;
  uniform vec3 uColor;
  void main() { gl_FragColor = vec4(uColor, vAlpha); }
`;

/** Petals: instanced quads that fall, sway and spin. */
export const PETALS_VERTEX = /* glsl */ `
  attribute vec4 aSeed;
  attribute float aPhase;
  uniform float uTime;
  uniform float uAspect;
  varying vec2 vUv;
  varying float vAlpha;
  float wrap(float v) { return mod(v + 1.0, 2.0) - 1.0; }
  void main() {
    vUv = uv;
    float size = 0.018 + aSeed.z * 0.012;
    float angle = uTime * (0.4 + aSeed.w) + aPhase;
    vec2 local = position.xy * vec2(size * 0.6, size);
    local = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * local;
    local.y *= 0.6 + 0.4 * abs(cos(uTime * 0.7 + aPhase));
    float y = wrap(aSeed.y - uTime * (0.04 + aSeed.w * 0.05));
    float x = aSeed.x + sin(uTime * 0.5 + aPhase) * 0.05;
    vAlpha = 0.55 + 0.35 * aSeed.w;
    gl_Position = vec4(x + local.x / uAspect, y + local.y, 0.0, 1.0);
  }
`;

export const PETALS_FRAGMENT = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  varying float vAlpha;
  uniform vec3 uColor;
  void main() {
    vec2 p = vUv - 0.5;
    float d = length(p * vec2(1.6, 1.0));
    float a = smoothstep(0.5, 0.35, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(mix(uColor, vec3(1.0), 0.35 - p.y * 0.4), a);
  }
`;
