"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { DayGrid } from "@/components/DayGrid";
import { BookingModal } from "@/components/BookingModal";
import {
  fetchResources,
  fetchBookingsForDay,
  createBooking,
  deleteBooking,
} from "@/lib/bookings";
import type { Resource, Booking } from "@/lib/types";
import { addDays, ymd, isToday } from "@/lib/time";

export default function Home() {
  const { user, loading, signIn } = useAuth();
  const [day, setDay] = useState(() => new Date());
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [modal, setModal] = useState<{ resource: Resource; slot: Date } | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  // ユーザー・対象日が変わったら再取得（アンマウント時は破棄）
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const [rs, bs] = await Promise.all([
          fetchResources(),
          fetchBookingsForDay(day),
        ]);
        if (cancelled) return;
        setResources(rs);
        setBookings(bs);
        setDataError(null);
      } catch {
        if (cancelled) return;
        setDataError("データの取得に失敗しました。Firebase設定を確認してください。");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, day]);

  // 予約作成・キャンセル後の手動リフレッシュ（イベントハンドラから呼ぶ）
  const reload = useCallback(async () => {
    if (!user) return;
    try {
      const [rs, bs] = await Promise.all([
        fetchResources(),
        fetchBookingsForDay(day),
      ]);
      setResources(rs);
      setBookings(bs);
      setDataError(null);
    } catch {
      setDataError("データの取得に失敗しました。Firebase設定を確認してください。");
    }
  }, [user, day]);

  if (loading) {
    return <div className="p-8 text-slate-500">読み込み中…</div>;
  }

  if (!user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">🗓️ Room &amp; Booth Booking</h1>
          <p className="mt-2 text-slate-500">
            会議室・フォンブースの予約システム
          </p>
        </div>
        <button
          onClick={() => signIn()}
          className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Googleでログイン
        </button>
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 p-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setDay((d) => addDays(d, -1))}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
          >
            ← 前日
          </button>
          <div className="font-medium">
            {ymd(day)} {isToday(day) && <span className="text-blue-600">（今日）</span>}
          </div>
          <button
            onClick={() => setDay((d) => addDays(d, 1))}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
          >
            翌日 →
          </button>
          {!isToday(day) && (
            <button
              onClick={() => setDay(new Date())}
              className="text-sm text-blue-600 underline"
            >
              今日へ
            </button>
          )}
        </div>

        {dataError && (
          <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {dataError}
          </p>
        )}

        {resources.length === 0 && !dataError ? (
          <p className="text-slate-500">
            予約対象がありません。<code>npm run seed</code> で初期データを投入してください。
          </p>
        ) : (
          <DayGrid
            day={day}
            resources={resources}
            bookings={bookings}
            currentUserId={user.uid}
            onSlotClick={(resource, slot) => setModal({ resource, slot })}
            onCancel={async (b) => {
              await deleteBooking(b.id);
              await reload();
            }}
          />
        )}
      </main>

      {modal && (
        <BookingModal
          resource={modal.resource}
          slotStart={modal.slot}
          onClose={() => setModal(null)}
          onSubmit={async (title, start, end) => {
            await createBooking({
              resourceId: modal.resource.id,
              userId: user.uid,
              userName: user.displayName ?? user.email ?? "unknown",
              title,
              start,
              end,
            });
            setModal(null);
            await reload();
          }}
        />
      )}
    </>
  );
}
