import { createHeroTextMask } from "./hero-text-mask";

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

describe("hero text mask", () => {
  it("maps measured glyphs into container-relative CSS coordinates", () => {
    const container = document.createElement("section");
    const title = document.createElement("h1");
    container.append(title);
    jest.spyOn(container, "getBoundingClientRect").mockReturnValue(rect(20, 30, 200, 100));

    const context = {
      clearRect: jest.fn(),
      fillText: jest.fn(),
      scale: jest.fn(),
      fillStyle: "",
      font: "",
      textAlign: "left",
      textBaseline: "middle",
    } as unknown as CanvasRenderingContext2D;
    const canvas = document.createElement("canvas");
    jest.spyOn(canvas, "getContext").mockReturnValue(context);

    const mask = createHeroTextMask({
      container,
      cssHeight: 100,
      cssWidth: 200,
      dpr: 1.25,
      elements: [title],
      generation: 4,
      maxTextureSize: 1024,
      createCanvas: () => canvas,
      measureGlyphs: () => [{ element: title, rect: rect(70, 60, 10, 20), text: "D" }],
    });

    expect(mask).toMatchObject({ generation: 4, height: 125, width: 250 });
    expect(context.scale).toHaveBeenCalledWith(1.25, 1.25);
    expect(context.fillText).toHaveBeenCalledWith("D", 50, 40);
  });

  it("declines masks beyond the reported texture limit", () => {
    expect(
      createHeroTextMask({
        container: document.createElement("section"),
        cssHeight: 900,
        cssWidth: 1200,
        dpr: 2,
        elements: [],
        generation: 1,
        maxTextureSize: 1024,
      })
    ).toBeNull();
  });
});
