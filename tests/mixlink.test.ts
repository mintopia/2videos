import { describe, it, expect } from "vitest";
import { parseMix, encodeMix, mixUrl } from "../src/mixlink";

const L = "dQw4w9WgXcQ";
const R = "9bZkp7q19f0";

describe("parseMix", () => {
  it("reads valid l, r, x", () => {
    expect(parseMix(`?l=${L}&r=${R}&x=0.25`)).toEqual({ left: L, right: R, x: 0.25 });
  });

  it("defaults x to 0.5 when absent", () => {
    expect(parseMix(`?l=${L}`)).toEqual({ left: L, right: null, x: 0.5 });
  });

  it("clamps and sanitises hostile x values", () => {
    expect(parseMix(`?x=2`).x).toBe(1);
    expect(parseMix(`?x=-5`).x).toBe(0);
    expect(parseMix(`?x=NaN`).x).toBe(0.5);
    expect(parseMix(`?x=`).x).toBe(0.5);
  });

  it("rejects malformed ids, leaving them null", () => {
    expect(parseMix(`?l=tooshort&r=${R}`)).toEqual({ left: null, right: R, x: 0.5 });
    expect(parseMix(`?l=has!llegal!!`).left).toBeNull();
  });

  it("takes the first value of a duplicated param", () => {
    expect(parseMix(`?l=${L}&l=${R}`).left).toBe(L);
  });
});

describe("encodeMix", () => {
  it("omits centre x and missing ids", () => {
    expect(encodeMix({ left: null, right: null, x: 0.5 })).toBe("");
    expect(encodeMix({ left: L, right: null, x: 0.5 })).toBe(`?l=${L}`);
  });

  it("includes x only when off centre", () => {
    expect(encodeMix({ left: L, right: R, x: 0.5 })).toBe(`?l=${L}&r=${R}`);
    expect(encodeMix({ left: L, right: R, x: 0.25 })).toBe(`?l=${L}&r=${R}&x=0.25`);
  });

  it("round-trips through parseMix", () => {
    const state = { left: L, right: R, x: 0.3 };
    expect(parseMix(encodeMix(state))).toEqual(state);
  });
});

describe("mixUrl", () => {
  it("builds an absolute canonical url", () => {
    expect(mixUrl({ left: L, right: null, x: 0.5 }, "https://mix.example", "/")).toBe(
      `https://mix.example/?l=${L}`,
    );
  });
});
