import { describe, expect, it } from "vitest";
import { HandHistory, LandmarkSmoother, type Landmark } from "./AslEngine";
import { fuseScores, getContextBias } from "./ContextModel";

const frame = (y: number): Landmark[] =>
  Array.from({ length: 21 }, () => ({ x: 0.5, y, z: 0 }));

describe("LandmarkSmoother", () => {
  it("passes the first frame through untouched", () => {
    const smoothed = new LandmarkSmoother().smooth(frame(0.5), 0.01);
    expect(smoothed[0]).toEqual({ x: 0.5, y: 0.5, z: 0 });
  });

  it("pulls a jump toward the previous frame instead of snapping to it", () => {
    const smoother = new LandmarkSmoother();
    smoother.smooth(frame(0), 0.01);
    const next = smoother.smooth(frame(1), 0.01)[0].y;
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
  });

  it("clamps the adaptive alpha so fast motion still lags slightly", () => {
    const smoother = new LandmarkSmoother();
    smoother.smooth(frame(0), 10);
    // velocity * 10 saturates at the 0.8 ceiling, never 1.0
    expect(smoother.smooth(frame(1), 10)[0].y).toBeCloseTo(0.8, 5);
  });
});

describe("HandHistory", () => {
  it("reports a default velocity before it has two frames", () => {
    expect(new HandHistory().getVelocity()).toBe(0.005);
  });

  it("measures displacement between the last two frames", () => {
    const history = new HandHistory();
    history.add(frame(0));
    history.add(frame(0.3));
    expect(history.getVelocity()).toBeCloseTo(0.3, 5);
  });

  it("measures velocity from the latest pair even after the buffer rolls over", () => {
    const history = new HandHistory();
    for (let i = 0; i < 100; i++) history.add(frame(i / 100));
    expect(history.getVelocity()).toBeCloseTo(0.01, 5);
  });

  it("needs 15 frames before it reports vertical peaks", () => {
    const history = new HandHistory();
    for (let i = 0; i < 10; i++) history.add(frame(i % 2 === 0 ? 0.4 : 0.6));
    expect(history.countVerticalPeaks()).toBe(0);
  });

  it("counts alternating motion as peaks once the buffer is deep enough", () => {
    const history = new HandHistory();
    for (let i = 0; i < 20; i++) history.add(frame(i % 2 === 0 ? 0.4 : 0.6));
    expect(history.countVerticalPeaks()).toBeGreaterThan(0);
  });
});

describe("ContextModel", () => {
  it("returns no bias for an unknown or absent previous word", () => {
    expect(getContextBias(null)).toEqual({});
    expect(getContextBias("BANANA")).toEqual({});
  });

  it("returns the bigram weights for a known previous word", () => {
    expect(getContextBias("I / ME").LOVE).toBe(0.8);
  });

  it("only biases candidates the geometric pass already scored", () => {
    const fused = fuseScores({ LOVE: 1 }, { LOVE: 0.8, YES: 0.9 });
    expect(fused.LOVE).toBeCloseTo(1 * 0.7 + 0.8 * 0.3, 5);
    expect(fused).not.toHaveProperty("YES");
  });

  it("leaves scores untouched when there is no context", () => {
    expect(fuseScores({ LOVE: 1, YES: 0.5 }, {})).toEqual({ LOVE: 1, YES: 0.5 });
  });
});
