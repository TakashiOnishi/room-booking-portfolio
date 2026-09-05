// 予約の時間帯競合判定（純関数・UI/DBに非依存）

/** 時間帯（epoch ms）。end は排他的（[start, end)） */
export interface TimeRange {
  start: number;
  end: number;
}

/**
 * 2つの時間帯が重なるか判定する。
 * 端が接するだけ（前の end == 次の start）は重ならない扱い。
 */
export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

/** start < end かつ正の長さを持つ有効な時間帯か */
export function isValidRange(r: TimeRange): boolean {
  return Number.isFinite(r.start) && Number.isFinite(r.end) && r.start < r.end;
}

/**
 * 対象の時間帯が、既存予約のいずれかと競合するか判定する。
 * 同一リソース内の既存予約リストを渡す前提。
 * excludeId を渡すと、その予約自身は判定から除外する（更新時用）。
 */
export function hasConflict(
  candidate: TimeRange,
  existing: Array<TimeRange & { id?: string }>,
  excludeId?: string,
): boolean {
  return existing.some(
    (e) => e.id !== excludeId && overlaps(candidate, e),
  );
}
