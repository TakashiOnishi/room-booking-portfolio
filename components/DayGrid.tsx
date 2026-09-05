"use client";

import type { Resource, Booking } from "@/lib/types";
import { daySlots, hhmm, SLOT_MINUTES } from "@/lib/time";

interface Props {
  day: Date;
  resources: Resource[];
  bookings: Booking[];
  currentUserId: string;
  onSlotClick: (resource: Resource, slotStart: Date) => void;
  onCancel: (booking: Booking) => void;
}

const TYPE_LABEL: Record<Resource["type"], string> = {
  meeting_room: "会議室",
  phone_booth: "ブース",
};

/** その日の日ビュー。行=時間スロット、列=リソース。既存予約はブロック表示 */
export function DayGrid({
  day,
  resources,
  bookings,
  currentUserId,
  onSlotClick,
  onCancel,
}: Props) {
  const slots = daySlots(day);
  const slotMs = SLOT_MINUTES * 60 * 1000;

  const bookingAt = (resourceId: string, slot: Date): Booking | undefined =>
    bookings.find(
      (b) =>
        b.resourceId === resourceId &&
        b.start <= slot.getTime() &&
        b.end > slot.getTime(),
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-16 border-b border-slate-200 p-2 text-left font-medium text-slate-500">
              時間
            </th>
            {resources.map((r) => (
              <th
                key={r.id}
                className="border-b border-l border-slate-200 p-2 text-left font-medium"
              >
                <div>{r.name}</div>
                <div className="text-xs font-normal text-slate-400">
                  {TYPE_LABEL[r.type]}・{r.location}・{r.capacity}名
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.getTime()}>
              <td className="border-b border-slate-100 p-2 align-top text-xs text-slate-500">
                {hhmm(slot.getTime())}
              </td>
              {resources.map((r) => {
                const b = bookingAt(r.id, slot);
                // 予約の開始スロットのみブロック本体を描画
                const isStart = b && b.start === slot.getTime();
                if (b && !isStart) return <td key={r.id} className="border-l border-slate-100" />;
                if (b && isStart) {
                  const span = Math.max(1, Math.round((b.end - b.start) / slotMs));
                  const mine = b.userId === currentUserId;
                  return (
                    <td
                      key={r.id}
                      rowSpan={span}
                      className="border-l border-slate-100 p-1 align-top"
                    >
                      <div
                        className={`h-full rounded-md p-2 text-xs ${
                          mine
                            ? "bg-blue-100 text-blue-900"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="font-medium">{b.title}</div>
                        <div className="text-[11px] opacity-70">
                          {hhmm(b.start)}–{hhmm(b.end)} / {b.userName}
                        </div>
                        {mine && (
                          <button
                            onClick={() => onCancel(b)}
                            className="mt-1 text-[11px] text-red-600 underline"
                          >
                            キャンセル
                          </button>
                        )}
                      </div>
                    </td>
                  );
                }
                return (
                  <td
                    key={r.id}
                    onClick={() => onSlotClick(r, slot)}
                    className="cursor-pointer border-b border-l border-slate-100 p-2 hover:bg-blue-50"
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
