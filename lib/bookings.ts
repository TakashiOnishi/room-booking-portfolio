// Firestore データアクセス層（リソース・予約の CRUD）

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Resource, Booking, BookingInput } from "./types";
import { hasConflict } from "./overlap";

const RESOURCES = "resources";
const BOOKINGS = "bookings";

/** 予約対象マスタを全件取得（有効なもののみ） */
export async function fetchResources(): Promise<Resource[]> {
  const snap = await getDocs(collection(db, RESOURCES));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Resource, "id">) }))
    .filter((r) => r.active)
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

/** 指定日（ローカル 0:00〜翌0:00）の予約を全リソース分取得 */
export async function fetchBookingsForDay(day: Date): Promise<Booking[]> {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, BOOKINGS),
    where("start", ">=", Timestamp.fromDate(start)),
    where("start", "<", Timestamp.fromDate(end)),
    orderBy("start"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

/**
 * 予約を作成する。クライアント側でも競合チェックを行う（UX向上）。
 * 最終的な整合性は Firestore ルール + 同時実行時の再取得で担保する方針。
 */
export async function createBooking(input: BookingInput): Promise<string> {
  const sameResource = await fetchBookingsForResourceRange(
    input.resourceId,
    input.start,
    input.end,
  );
  if (hasConflict({ start: input.start, end: input.end }, sameResource)) {
    throw new Error("CONFLICT");
  }
  const ref = await addDoc(collection(db, BOOKINGS), {
    resourceId: input.resourceId,
    userId: input.userId,
    userName: input.userName,
    title: input.title,
    start: Timestamp.fromMillis(input.start),
    end: Timestamp.fromMillis(input.end),
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

/** 予約をキャンセル（削除） */
export async function deleteBooking(id: string): Promise<void> {
  await deleteDoc(doc(db, BOOKINGS, id));
}

/** 特定リソースの、指定時間帯に少しでもかかる予約を取得（競合チェック用） */
async function fetchBookingsForResourceRange(
  resourceId: string,
  start: number,
  end: number,
): Promise<Array<Booking & { id: string }>> {
  // start が候補終了より前の同一リソース予約を取り、クライアントで end 判定する
  const q = query(
    collection(db, BOOKINGS),
    where("resourceId", "==", resourceId),
    where("start", "<", Timestamp.fromMillis(end)),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => fromDoc(d.id, d.data()))
    .filter((b) => b.end > start);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromDoc(id: string, data: any): Booking {
  return {
    id,
    resourceId: data.resourceId,
    userId: data.userId,
    userName: data.userName,
    title: data.title,
    start: (data.start as Timestamp).toMillis(),
    end: (data.end as Timestamp).toMillis(),
    createdAt: (data.createdAt as Timestamp)?.toMillis() ?? 0,
  };
}
