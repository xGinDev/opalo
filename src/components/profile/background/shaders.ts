// GLSL for the profile particles. Everything is computed in clip space ([-1, 1]),
// so no camera math is needed and the canvas always covers its container.

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
