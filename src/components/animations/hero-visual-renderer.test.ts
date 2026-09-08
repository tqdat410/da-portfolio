import { chooseHeroVisualTier, composeHeroColor, createHeroRenderer } from "./hero-visual-renderer";

function createWebGlStub() {
  const shaders: string[] = [];
  let error = 0;
  const gl = {
    ARRAY_BUFFER: 0x8892,
    CLAMP_TO_EDGE: 0x812f,
    COMPILE_STATUS: 0x8b81,
    FLOAT: 0x1406,
    FRAGMENT_SHADER: 0x8b30,
    HIGH_FLOAT: 0x8df2,
    LINEAR: 0x2601,
    LINK_STATUS: 0x8b82,
    MAX_FRAGMENT_UNIFORM_VECTORS: 0x8dfd,
    MAX_TEXTURE_SIZE: 0x0d33,
    NO_ERROR: 0,
    RGBA: 0x1908,
    STATIC_DRAW: 0x88e4,
    TEXTURE0: 0x84c0,
    TEXTURE_2D: 0x0de1,
    TEXTURE_MAG_FILTER: 0x2800,
    TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_WRAP_S: 0x2802,
    TEXTURE_WRAP_T: 0x2803,
    TRIANGLE_STRIP: 0x0005,
    UNPACK_FLIP_Y_WEBGL: 0x9240,
    UNSIGNED_BYTE: 0x1401,
    VERTEX_SHADER: 0x8b31,
    activeTexture: jest.fn(),
    attachShader: jest.fn(),
    bindBuffer: jest.fn(),
    bindTexture: jest.fn(),
    bufferData: jest.fn(),
    compileShader: jest.fn(),
    createBuffer: jest.fn(() => ({ type: "buffer" })),
    createProgram: jest.fn(() => ({ type: "program" })),
    createShader: jest.fn((type: number) => ({ type })),
    createTexture: jest.fn(() => ({ type: "texture" })),
    deleteBuffer: jest.fn(),
    deleteProgram: jest.fn(),
    deleteShader: jest.fn(),
    deleteTexture: jest.fn(),
    drawArrays: jest.fn(),
    enableVertexAttribArray: jest.fn(),
    getAttribLocation: jest.fn(() => 0),
    getError: jest.fn(() => error),
    getExtension: jest.fn(() => null),
    getParameter: jest.fn((parameter: number) =>
      parameter === 0x8dfd ? 64 : parameter === 0x0d33 ? 4096 : 0
    ),
    getProgramParameter: jest.fn(() => true),
    getShaderParameter: jest.fn(() => true),
    getShaderPrecisionFormat: jest.fn(() => ({ precision: 23 })),
    getUniformLocation: jest.fn((_program: unknown, name: string) => ({ name })),
    isContextLost: jest.fn(() => false),
    linkProgram: jest.fn(),
    pixelStorei: jest.fn(),
    shaderSource: jest.fn((_shader: unknown, source: string) => shaders.push(source)),
    texImage2D: jest.fn(),
    texParameteri: jest.fn(),
    uniform1i: jest.fn(),
    uniform2f: jest.fn(),
    uniform3f: jest.fn(),
    uniform3fv: jest.fn(),
    useProgram: jest.fn(),
    vertexAttribPointer: jest.fn(),
    viewport: jest.fn(),
  };

  return {
    gl: gl as unknown as WebGLRenderingContext,
    shaders,
    setError(nextError: number) {
      error = nextError;
    },
  };
}

describe("hero visual renderer policies", () => {
  it("uses a lighter bounded tier for compact viewports", () => {
    expect(chooseHeroVisualTier(390, 844, 3)).toEqual({
      ballCount: 10,
      dpr: 2.5,
      frameIntervalMs: 1000 / 30,
      radiusScale: 1.25,
    });
  });

  it("preserves full density on desktop while respecting capability limits", () => {
    expect(chooseHeroVisualTier(1385, 779, 2, 24)).toEqual({
      ballCount: 24,
      dpr: 1.5,
      frameIntervalMs: 1000 / 60,
      radiusScale: 1,
    });
  });

  it("continuously swaps palette endpoints inside glyphs", () => {
    const palette = {
      background: [0, 0, 0] as [number, number, number],
      foreground: [1, 1, 1] as [number, number, number],
    };

    expect(composeHeroColor(0, 0, palette)).toEqual([0, 0, 0]);
    expect(composeHeroColor(0, 1, palette)).toEqual([1, 1, 1]);
    expect(composeHeroColor(1, 1, palette)).toEqual([0, 0, 0]);
    expect(composeHeroColor(0.25, 0.5, palette)).toEqual([0.5, 0.5, 0.5]);
  });

  it("returns a stable fallback result when WebGL is unavailable", () => {
    const canvas = document.createElement("canvas");
    jest.spyOn(canvas, "getContext").mockReturnValue(null);

    expect(
      createHeroRenderer(canvas, {
        background: [0, 0, 0],
        foreground: [1, 1, 1],
      })
    ).toEqual({ ok: false, reason: "context-unavailable", retryable: false });
  });

  it("uploads one text mask, renders one draw call, and disposes idempotently", () => {
    const canvas = document.createElement("canvas");
    const stub = createWebGlStub();
    jest.spyOn(canvas, "getContext").mockReturnValue(stub.gl);
    const created = createHeroRenderer(canvas, {
      background: [0, 0, 0],
      foreground: [1, 1, 1],
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const maskCanvas = document.createElement("canvas");
    const resized = created.value.resize(390, 844, chooseHeroVisualTier(390, 844, 3), {
      canvas: maskCanvas,
      generation: 1,
      height: 1055,
      width: 488,
    });
    expect(resized.ok).toBe(true);
    expect(canvas).toMatchObject({ width: 488, height: 1055 });
    expect(stub.gl.texImage2D).toHaveBeenCalledTimes(1);

    expect(created.value.render(1).ok).toBe(true);
    expect(stub.gl.drawArrays).toHaveBeenCalledTimes(1);
    created.value.dispose();
    created.value.dispose();
    expect(stub.gl.deleteTexture).toHaveBeenCalledTimes(1);
    expect(stub.gl.deleteBuffer).toHaveBeenCalledTimes(1);
    expect(stub.gl.deleteProgram).toHaveBeenCalledTimes(1);
  });

  it("selects derivative smoothing when available and rejects unsafe limits", () => {
    const capableCanvas = document.createElement("canvas");
    const capable = createWebGlStub();
    jest.mocked(capable.gl.getExtension).mockReturnValue({} as OES_standard_derivatives);
    jest.spyOn(capableCanvas, "getContext").mockReturnValue(capable.gl);
    expect(
      createHeroRenderer(capableCanvas, { background: [0, 0, 0], foreground: [1, 1, 1] }).ok
    ).toBe(true);
    expect(capable.shaders.some((source) => source.includes("GL_OES_standard_derivatives"))).toBe(
      true
    );

    const limitedCanvas = document.createElement("canvas");
    const limited = createWebGlStub();
    jest.mocked(limited.gl.getParameter).mockReturnValue(4);
    jest.spyOn(limitedCanvas, "getContext").mockReturnValue(limited.gl);
    expect(
      createHeroRenderer(limitedCanvas, { background: [0, 0, 0], foreground: [1, 1, 1] })
    ).toEqual({ ok: false, reason: "insufficient-capability", retryable: false });
  });

  it("samples glyph coverage from the antialiased alpha channel", () => {
    const canvas = document.createElement("canvas");
    const stub = createWebGlStub();
    jest.spyOn(canvas, "getContext").mockReturnValue(stub.gl);

    expect(createHeroRenderer(canvas, { background: [0, 0, 0], foreground: [1, 1, 1] }).ok).toBe(
      true
    );
    expect(stub.shaders.some((source) => source.includes("texture2D(uTextMask, vUv).a"))).toBe(
      true
    );
  });

  it("reports texture upload and draw errors without throwing", () => {
    const canvas = document.createElement("canvas");
    const stub = createWebGlStub();
    jest.spyOn(canvas, "getContext").mockReturnValue(stub.gl);
    const created = createHeroRenderer(canvas, {
      background: [0, 0, 0],
      foreground: [1, 1, 1],
    });
    if (!created.ok) throw new Error("Expected renderer creation to succeed");
    const tier = chooseHeroVisualTier(390, 844, 1);
    const mask = {
      canvas: document.createElement("canvas"),
      generation: 1,
      height: 844,
      width: 390,
    };

    stub.setError(1);
    expect(created.value.resize(390, 844, tier, mask)).toEqual({
      ok: false,
      reason: "texture-upload",
      retryable: true,
    });
    expect(created.value.render(1)).toEqual({
      ok: false,
      reason: "draw-failed",
      retryable: true,
    });
  });
});
