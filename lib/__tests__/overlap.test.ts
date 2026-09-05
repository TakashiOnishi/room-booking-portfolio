import { describe, it, expect } from "vitest";
import { overlaps, isValidRange, hasConflict } from "../overlap";

const t = (h: number, m = 0) => new Date(2026, 0, 1, h, m).getTime();

describe("overlaps", () => {
  it("完全に重なる時間帯は true", () => {
    expect(overlaps({ start: t(10), end: t(11) }, { start: t(10), end: t(11) })).toBe(true);
  });

  it("一部が重なる時間帯は true", () => {
    expect(overlaps({ start: t(10), end: t(11) }, { start: t(10, 30), end: t(11, 30) })).toBe(true);
  });

  it("端が接するだけ（前の end == 次の start）は false", () => {
    expect(overlaps({ start: t(10), end: t(11) }, { start: t(11), end: t(12) })).toBe(false);
  });

  it("完全に離れている時間帯は false", () => {
    expect(overlaps({ start: t(10), end: t(11) }, { start: t(13), end: t(14) })).toBe(false);
  });

  it("内包される時間帯は true", () => {
    expect(overlaps({ start: t(10), end: t(14) }, { start: t(11), end: t(12) })).toBe(true);
  });
});

describe("isValidRange", () => {
  it("start < end は有効", () => {
    expect(isValidRange({ start: t(10), end: t(11) })).toBe(true);
  });
  it("start == end は無効", () => {
    expect(isValidRange({ start: t(10), end: t(10) })).toBe(false);
  });
  it("start > end は無効", () => {
    expect(isValidRange({ start: t(11), end: t(10) })).toBe(false);
  });
});

describe("hasConflict", () => {
  const existing = [
    { id: "a", start: t(9), end: t(10) },
    { id: "b", start: t(13), end: t(14) },
  ];

  it("空きスロットは競合なし", () => {
    expect(hasConflict({ start: t(11), end: t(12) }, existing)).toBe(false);
  });

  it("既存と重なると競合あり", () => {
    expect(hasConflict({ start: t(9, 30), end: t(10, 30) }, existing)).toBe(true);
  });

  it("excludeId で自身を除外できる（更新時）", () => {
    expect(hasConflict({ start: t(9), end: t(10) }, existing, "a")).toBe(false);
  });
});
