import { describe, it, expect } from "vitest";
import { clamp01, equalPowerGains, gainToVolume, volumesFor } from "../src/crossfader";

describe("clamp01", () => {
  it("passes through values in range", () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
  });

  it("clamps out-of-range values", () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(9)).toBe(1);
  });

  it("defaults non-finite values to centre (garbage in, safe centre out)", () => {
    expect(clamp01(NaN)).toBe(0.5);
    expect(clamp01(Infinity)).toBe(0.5);
    expect(clamp01(Number.NEGATIVE_INFINITY)).toBe(0.5);
  });
});

describe("equalPowerGains", () => {
  it("is full-left at x=0", () => {
    const g = equalPowerGains(0);
    expect(g.left).toBeCloseTo(1, 6);
    expect(g.right).toBeCloseTo(0, 6);
  });

  it("is full-right at x=1", () => {
    const g = equalPowerGains(1);
    expect(g.left).toBeCloseTo(0, 6);
    expect(g.right).toBeCloseTo(1, 6);
  });

  it("sits at ~0.707 on both sides at centre (constant power)", () => {
    const g = equalPowerGains(0.5);
    expect(g.left).toBeCloseTo(Math.SQRT1_2, 6);
    expect(g.right).toBeCloseTo(Math.SQRT1_2, 6);
  });

  it("keeps left^2 + right^2 == 1 across the travel (equal power)", () => {
    for (const x of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      const g = equalPowerGains(x);
      expect(g.left ** 2 + g.right ** 2).toBeCloseTo(1, 6);
    }
  });
});

describe("gainToVolume", () => {
  it("maps gain to integer 0..100", () => {
    expect(gainToVolume(0)).toBe(0);
    expect(gainToVolume(1)).toBe(100);
    expect(gainToVolume(Math.SQRT1_2)).toBe(71);
  });

  it("clamps and rounds", () => {
    expect(gainToVolume(-1)).toBe(0);
    expect(gainToVolume(2)).toBe(100);
    expect(Number.isInteger(gainToVolume(0.123))).toBe(true);
  });
});

describe("volumesFor", () => {
  it("gives 71/71 at centre", () => {
    expect(volumesFor(0.5)).toEqual({ left: 71, right: 71 });
  });
  it("gives 100/0 at full left", () => {
    expect(volumesFor(0)).toEqual({ left: 100, right: 0 });
  });
});
