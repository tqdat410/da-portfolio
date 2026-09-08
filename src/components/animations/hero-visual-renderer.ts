import type { HeroTextMask } from "./hero-text-mask";

export type HeroRendererFailure =
  | "context-unavailable"
  | "insufficient-capability"
  | "shader-compile"
  | "program-link"
  | "texture-upload"
  | "draw-failed"
  | "context-lost";

export type HeroRendererResult<T = undefined> =
  { ok: true; value: T } | { ok: false; reason: HeroRendererFailure; retryable: boolean };

export type HeroVisualTier = {
  ballCount: number;
  dpr: number;
  frameIntervalMs: number;
  radiusScale: number;
};

export type HeroRenderer = {
  readonly maxTextureSize: number;
  render(elapsedSeconds: number): HeroRendererResult;
  resize(
    cssWidth: number,
    cssHeight: number,
    tier: HeroVisualTier,
    mask: HeroTextMask
  ): HeroRendererResult;
  dispose(): void;
};

type Palette = {
  background: [number, number, number];
  foreground: [number, number, number];
};

type Ball = {
  baseScale: number;
  dtFactor: number;
  radius: number;
  start: number;
  toggle: number;
};

const MAX_DESKTOP_BALLS = 30;
const MIN_BALLS = 8;
const ANIMATION_SIZE = 30;
const CLUMP_FACTOR = 2;
const SPEED = 0.1;

const vertexShader = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

function fragmentShader(maxBalls: number, highPrecision: boolean, derivatives: boolean) {
  return `
${derivatives ? "#extension GL_OES_standard_derivatives : enable" : ""}
precision ${highPrecision ? "highp" : "mediump"} float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform vec3 uBackground;
uniform vec3 uForeground;
uniform sampler2D uTextMask;
uniform int uBallCount;
uniform vec3 uBalls[${maxBalls}];
uniform vec3 uOrbitBall;

float fieldValue(vec2 center, float radius, vec2 point) {
  vec2 delta = point - center;
  float distanceSquared = max(dot(delta, delta), 0.0005);
  return (radius * radius) / distanceSquared;
}

void main() {
  vec2 fragment = gl_FragCoord.xy;
  float scale = ${ANIMATION_SIZE.toFixed(1)} / uResolution.y;
  vec2 point = (fragment - uResolution * 0.5) * scale;
  float field = fieldValue(uOrbitBall.xy, uOrbitBall.z, point);

  for (int index = 0; index < ${maxBalls}; index++) {
    if (index >= uBallCount) break;
    field += fieldValue(uBalls[index].xy, uBalls[index].z, point);
  }

  float edge = ${derivatives ? "max(min(fwidth(field), 1.0), 0.0005)" : `max(${ANIMATION_SIZE.toFixed(1)} / uResolution.y * 1.5, 0.025)`};
  float blobCoverage = smoothstep(-1.0, 1.0, (field - 1.3) / edge);
  float glyphAlpha = texture2D(uTextMask, vUv).a;
  vec3 scene = mix(uBackground, uForeground, blobCoverage);
  vec3 inverseScene = mix(uForeground, uBackground, blobCoverage);
  vec3 finalColor = mix(scene, inverseScene, glyphAlpha);
  gl_FragColor = vec4(finalColor, 1.0);
}
`;
}

function success<T>(value: T): HeroRendererResult<T> {
  return { ok: true, value };
}

function failure(reason: HeroRendererFailure, retryable: boolean): HeroRendererResult<never> {
  return { ok: false, reason, retryable };
}

function fract(value: number) {
  return value - Math.floor(value);
}

function hash(index: number): [number, number, number] {
  const values = [index * 0.1031, index * 0.103, index * 0.0973].map(fract);
  const dot =
    values[0] * (values[1] + 33.33) +
    values[1] * (values[2] + 33.33) +
    values[2] * (values[0] + 33.33);
  return values.map((value) => fract(value + dot)) as [number, number, number];
}

function hashVector(values: [number, number, number]): [number, number, number] {
  const scaled = [values[0] * 0.1031, values[1] * 0.103, values[2] * 0.0973].map(fract);
  const dot =
    scaled[0] * (scaled[1] + 33.33) +
    scaled[1] * (scaled[0] + 33.33) +
    scaled[2] * (scaled[2] + 33.33);
  const mixed = scaled.map((value) => fract(value + dot));
  return [
    fract((mixed[0] + mixed[1]) * mixed[2]),
    fract((mixed[0] + mixed[0]) * mixed[1]),
    fract((mixed[1] + mixed[0]) * mixed[0]),
  ];
}

function createBalls(count: number): Ball[] {
  return Array.from({ length: count }, (_, index) => {
    const values = hash(index + 1);
    const secondary = hashVector(values);
    return {
      start: values[0] * Math.PI * 2,
      dtFactor: Math.PI * (0.1 + values[1] * 0.3),
      baseScale: 5 + values[1] * 5,
      toggle: Math.floor(secondary[0] * 2),
      radius: 0.5 + secondary[2] * 1.5,
    };
  });
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function chooseHeroVisualTier(
  cssWidth: number,
  cssHeight: number,
  deviceDpr: number,
  maxBalls = MAX_DESKTOP_BALLS
): HeroVisualTier {
  const compact = Math.min(cssWidth, cssHeight) < 768;
  return {
    ballCount: Math.min(maxBalls, compact ? 10 : MAX_DESKTOP_BALLS),
    dpr: Math.min(Math.max(deviceDpr || 1, 1), compact ? 2.5 : 1.5),
    frameIntervalMs: compact ? 1000 / 30 : 1000 / 60,
    radiusScale: compact ? 1.25 : 1,
  };
}

export function composeHeroColor(
  blobCoverage: number,
  glyphAlpha: number,
  palette: Palette
): [number, number, number] {
  return palette.background.map((background, channel) => {
    const foreground = palette.foreground[channel];
    const scene = background + (foreground - background) * blobCoverage;
    const inverse = foreground + (background - foreground) * blobCoverage;
    return scene + (inverse - scene) * glyphAlpha;
  }) as [number, number, number];
}

export function createHeroRenderer(
  canvas: HTMLCanvasElement,
  palette: Palette
): HeroRendererResult<HeroRenderer> {
  let gl: WebGLRenderingContext;
  try {
    const context = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: false,
      stencil: false,
    });
    if (!context) return failure("context-unavailable", false);
    gl = context;
  } catch {
    return failure("context-unavailable", false);
  }

  const maxUniformVectors = Number(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)) || 0;
  const maxBalls = Math.min(MAX_DESKTOP_BALLS, Math.max(0, maxUniformVectors - 16));
  const maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0;
  if (maxBalls < MIN_BALLS || maxTextureSize < 512) {
    return failure("insufficient-capability", false);
  }

  const highPrecision =
    (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)?.precision ?? 0) > 0;
  const derivatives = Boolean(gl.getExtension("OES_standard_derivatives"));
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShader(maxBalls, highPrecision, derivatives)
  );
  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return failure("shader-compile", false);
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return failure("program-link", false);
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return failure("program-link", false);
  }

  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  if (!buffer || !texture) {
    if (buffer) gl.deleteBuffer(buffer);
    if (texture) gl.deleteTexture(texture);
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return failure("insufficient-capability", false);
  }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    background: gl.getUniformLocation(program, "uBackground"),
    foreground: gl.getUniformLocation(program, "uForeground"),
    resolution: gl.getUniformLocation(program, "uResolution"),
    ballCount: gl.getUniformLocation(program, "uBallCount"),
    balls: gl.getUniformLocation(program, "uBalls[0]"),
    orbit: gl.getUniformLocation(program, "uOrbitBall"),
    textMask: gl.getUniformLocation(program, "uTextMask"),
  };
  gl.uniform3fv(uniforms.background, palette.background);
  gl.uniform3fv(uniforms.foreground, palette.foreground);
  gl.uniform1i(uniforms.textMask, 0);

  const balls = createBalls(maxBalls);
  const ballData = new Float32Array(maxBalls * 3);
  let activeCount = Math.min(maxBalls, MAX_DESKTOP_BALLS);
  let activeRadiusScale = 1;
  let cssAspect = 1;
  let disposed = false;

  const renderer: HeroRenderer = {
    maxTextureSize,
    resize(cssWidth, cssHeight, tier, mask) {
      if (disposed || gl.isContextLost()) return failure("context-lost", true);
      if (mask.width > maxTextureSize || mask.height > maxTextureSize) {
        return failure("insufficient-capability", false);
      }

      activeCount = Math.min(tier.ballCount, maxBalls);
      activeRadiusScale = tier.radiusScale;
      cssAspect = cssWidth / Math.max(cssHeight, 1);
      canvas.width = mask.width;
      canvas.height = mask.height;
      gl.viewport(0, 0, mask.width, mask.height);
      gl.uniform2f(uniforms.resolution, mask.width, mask.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask.canvas);
      return gl.getError() === gl.NO_ERROR ? success(undefined) : failure("texture-upload", true);
    },
    render(elapsedSeconds) {
      if (disposed || gl.isContextLost()) return failure("context-lost", true);

      for (let index = 0; index < activeCount; index += 1) {
        const ball = balls[index];
        const delta = elapsedSeconds * SPEED * ball.dtFactor;
        const angle = ball.start + delta;
        ballData[index * 3] = Math.cos(angle) * ball.baseScale * CLUMP_FACTOR;
        ballData[index * 3 + 1] =
          Math.sin(angle + delta * ball.toggle) * ball.baseScale * CLUMP_FACTOR;
        ballData[index * 3 + 2] = ball.radius * activeRadiusScale;
      }

      gl.uniform1i(uniforms.ballCount, activeCount);
      gl.uniform3fv(uniforms.balls, ballData);
      gl.uniform3f(
        uniforms.orbit,
        Math.cos(elapsedSeconds * SPEED) * ANIMATION_SIZE * cssAspect * 0.15,
        Math.sin(elapsedSeconds * SPEED) * ANIMATION_SIZE * 0.15,
        2 * activeRadiusScale
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return gl.getError() === gl.NO_ERROR ? success(undefined) : failure("draw-failed", true);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    },
  };

  return success(renderer);
}
