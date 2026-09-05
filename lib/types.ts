// ドメイン型定義（汎用の予約対象・予約レコード）

export type ResourceType = "meeting_room" | "phone_booth";

/** 予約対象（会議室・フォンブース） */
export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  /** 収容人数（フォンブースは通常1） */
  capacity: number;
  /** 汎用のフロア表記（例: "3F"） */
  location: string;
  active: boolean;
}

/** 予約レコード。時刻はミリ秒エポックで保持し、Firestore Timestamp と相互変換する */
export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  title: string;
  /** 開始（epoch ms） */
  start: number;
  /** 終了（epoch ms） */
  end: number;
  createdAt: number;
}

/** 予約作成時の入力（id / createdAt はサーバ側で付与） */
export type BookingInput = Omit<Booking, "id" | "createdAt">;
