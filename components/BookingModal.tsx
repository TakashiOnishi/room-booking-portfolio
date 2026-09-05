"use client";

import { useState } from "react";
import type { Resource } from "@/lib/types";
import { SLOT_MINUTES, hhmm } from "@/lib/time";

interface Props {
  resource: Resource;
  slotStart: Date;
  onClose: () => void;
  onSubmit: (title: string, start: number, end: number) => Promise<void>;
}

/** 予約作成モーダル。開始スロット固定、長さ（30分単位）とタイトルを入力する */
export function BookingModal({ resource, slotStart, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [slots, setSlots] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const start = slotStart.getTime();
  const end = start + slots * SLOT_MINUTES * 60 * 1000;

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) {
      setError("用件を入力してください");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(title.trim(), start, end);
    } catch (e) {
      setError(
        e instanceof Error && e.message === "CONFLICT"
          ? "その時間帯は既に予約されています"
          : "保存に失敗しました",
      );
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <h2 className="mb-1 text-base font-semibold">予約を作成</h2>
        <p className="mb-4 text-sm text-slate-500">
          {resource.name}（{resource.location}）
        </p>

        <label className="mb-1 block text-sm font-medium">用件</label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 1on1 / 商談 / 集中作業"
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />

        <label className="mb-1 block text-sm font-medium">時間</label>
        <select
          value={slots}
          onChange={(e) => setSlots(Number(e.target.value))}
          className="mb-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n * SLOT_MINUTES}分
            </option>
          ))}
        </select>
        <p className="mb-4 text-sm text-slate-500">
          {hhmm(start)} 〜 {hhmm(end)}
        </p>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "保存中…" : "予約する"}
          </button>
        </div>
      </div>
    </div>
  );
}
