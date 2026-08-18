// GPGPU ping-pong shaders for Phase 5a's ledger particle field.
//
// Two variables, standard GPUComputationRenderer pattern: `texturePosition`
// (RGB = world position, A unused) and `textureVelocity` (RGB = velocity,
// A unused). velocityShader computes a spring force toward a per-particle
// target (its resting table position, or -- while its row is "flying"
// during Replay -- a point along a quadratic-Bezier arc toward the gate and
// on to its real backend pool) plus a pointer-proximity repulsion with a
// velocity-dependent perpendicular "turning" term. positionShader is plain
// Euler integration against the (previous-frame) velocity texture -- kept
// deliberately simple so the one place real behavior lives is the spring
// target logic, not split across two shaders.
//
// ROW_COUNT is a compile-time constant (must match LEDGER.length, 17 as of
// 2026-08-18 -- see lib/governance-ledger.ts) since GLSL array uniforms
// need a fixed size known at shader-compile time.
export const ROW_COUNT = 17;

const COMMON_HEAD = `
  #define ROW_COUNT ${ROW_COUNT}
  uniform sampler2D uRefTexture;   // R = ink mask, G = smoothed influence, from ledgerTexture.ts
  uniform vec3 uTableCenter;
  uniform float uTableHeight;      // world Y span (rows, top to bottom)
  uniform float uTableWidth;       // world Z span (columns, left to right)
  uniform vec3 uRowPool[ROW_COUNT];
  uniform float uReplayElapsed;    // seconds since Replay started; negative = not playing
  uniform float uReplayTravelDuration;
  uniform float uReplayStartOffset[ROW_COUNT];
  uniform float uReplayHoldSeconds; // how long an arrived particle sits at its pool before easing home

  // Table-plane rest position for this texel -- pure function of its own
  // UV, no extra texture needed. Row 0 (top of the rasterized canvas) maps
  // to vUv.y == 0 (THREE.DataTexture defaults flipY=false, so raw data row
  // 0 is the first row sampled at V=0) -- matches ledgerTexture.ts's own
  // top-to-bottom row order.
  vec3 restPosition(vec2 uv) {
    float y = uTableCenter.y + (0.5 - uv.y) * uTableHeight;
    float z = uTableCenter.z + (uv.x - 0.5) * uTableWidth;
    return vec3(uTableCenter.x, y, z);
  }

  int rowIndexOf(vec2 uv) {
    return clamp(int(floor(uv.y * float(ROW_COUNT))), 0, ROW_COUNT - 1);
  }

  // Quadratic Bezier through (start, gate-at-origin, pool) -- a close
  // visual match to the corridor's own CatmullRomCurve3(tile, gate, pool)
  // used by Ribbons/Pulses, cheap enough to evaluate per-particle per-frame.
  vec3 corridorArc(vec3 start, vec3 pool, float t) {
    float u = 1.0 - t;
    return u * u * start + 2.0 * u * t * vec3(0.0) + t * t * pool;
  }

  // Returns the particle's current target position: mid-flight along its
  // row's corridor arc while that row is actively replaying, briefly
  // holding at the pool just after arrival, otherwise resting on the table.
  vec3 targetPosition(vec2 uv, vec3 rest) {
    if (uReplayElapsed < 0.0) return rest;
    int row = rowIndexOf(uv);
    float localElapsed = uReplayElapsed - uReplayStartOffset[row];
    float phase = localElapsed / uReplayTravelDuration;
    vec3 pool = uRowPool[row];
    if (phase >= 0.0 && phase <= 1.0) {
      return corridorArc(rest, pool, phase);
    }
    if (phase > 1.0 && localElapsed < uReplayTravelDuration + uReplayHoldSeconds) {
      return pool;
    }
    return rest;
  }
`;

export const velocityFragmentShader = `
  ${COMMON_HEAD}
  uniform float uDelta;
  uniform vec3 uPointer;
  uniform float uPointerActive;
  uniform float uPointerRadius;
  uniform float uSpringStrength;
  uniform float uDamping;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;
    vec4 ref = texture2D(uRefTexture, uv);
    float influence = ref.g; // smoothed field -- lets nearby non-ink texels join the scatter too

    vec3 rest = restPosition(uv);
    vec3 target = targetPosition(uv, rest);
    bool flying = length(target - rest) > 0.001;

    vec3 force = (target - pos) * uSpringStrength;

    // Pointer scatter -- rest-state only (a flying particle is already
    // committed to its corridor arc; scattering it mid-flight would break
    // the "this is a real event" honesty of the replay). Strength scaled by
    // the smoothed influence field, per the plan's own R/G/B scheme, so the
    // scatter bridges between rows instead of only firing exactly on ink.
    if (uPointerActive > 0.5 && !flying) {
      vec3 toParticle = pos - uPointer;
      float d = length(toParticle);
      if (d < uPointerRadius && d > 0.0001) {
        float strength = (1.0 - d / uPointerRadius) * (0.4 + 0.6 * influence);
        vec3 away = toParticle / d;
        // Velocity-dependent turning: a perpendicular nudge scaled by the
        // particle's own current speed, so scatter arcs instead of firing
        // dead-straight away from the pointer every time.
        vec3 perp = vec3(-away.z, 0.0, away.x);
        float speed = length(vel);
        force += away * strength * 3.2 + perp * strength * speed * 0.8;
      }
    }

    vel = (vel + force * uDelta) * uDamping;
    gl_FragColor = vec4(vel, 1.0);
  }
`;

export const positionFragmentShader = `
  ${COMMON_HEAD}
  uniform float uDelta;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;
    // Alpha channel carries a "currently flying" flag (not a position
    // component) so the render pass can boost flying particles' point size
    // without needing its own copy of the replay-timing uniforms -- the
    // compute shader already has to work this out for the spring target,
    // this just surfaces that one bit alongside the position it computed.
    vec3 rest = restPosition(uv);
    vec3 target = targetPosition(uv, rest);
    float flying = length(target - rest) > 0.001 ? 1.0 : 0.0;
    gl_FragColor = vec4(pos + vel * uDelta, flying);
  }
`;

// Render-pass shaders (the visible Points, sampling the simulated position
// texture) -- separate from the two GPGPU compute shaders above.
export const renderVertexShader = `
  uniform sampler2D uPositionTexture;
  uniform sampler2D uRefTexture;
  uniform float uParticleSize;
  varying float vInk;
  varying float vRowFrac;
  varying float vFlying;

  void main() {
    vec4 posSample = texture2D(uPositionTexture, uv);
    vec4 ref = texture2D(uRefTexture, uv);
    vInk = ref.r;
    vRowFrac = uv.y;
    vFlying = posSample.a;

    vec3 pos = posSample.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Ink-mask particles hold the table's visible shape; near-zero ink
    // texels are hidden (not deleted -- they still run the same physics,
    // just render at ~0 size) so the field reads as the real rasterized
    // rows, not a uniform block of dots.
    float visible = smoothstep(0.06, 0.22, ref.r + ref.g * 0.15);
    // Flying particles (posSample.a, set by the position compute shader)
    // render larger -- makes the "detach and stream through the corridor"
    // moment actually read against the existing ribbons/pulses, which are
    // otherwise much bolder than a single ~2px resting particle.
    float flying = posSample.a;
    float sizeBoost = mix(1.0, 3.2, flying);
    gl_PointSize = uParticleSize * sizeBoost * visible * (300.0 / -mvPosition.z);
  }
`;

export const renderFragmentShader = `
  uniform vec3 uColorFree;
  uniform vec3 uColorPaid;
  uniform float uPaidRowFrac[${ROW_COUNT}];
  varying float vInk;
  varying float vRowFrac;
  varying float vFlying;

  void main() {
    // Soft circular point sprite instead of a hard square.
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    float inkAlpha = clamp(vInk * 1.6, 0.0, 1.0);
    float alpha = smoothstep(0.5, 0.15, d) * mix(inkAlpha, 1.0, vFlying * 0.6);
    if (alpha < 0.02) discard;

    int row = int(floor(vRowFrac * ${ROW_COUNT}.0));
    float isPaid = uPaidRowFrac[row];
    vec3 color = mix(uColorFree, uColorPaid, isPaid);
    gl_FragColor = vec4(color, alpha);
  }
`;
