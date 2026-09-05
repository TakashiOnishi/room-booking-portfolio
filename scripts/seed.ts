// 汎用の予約対象（会議室・フォンブース）を Firestore に投入する seed スクリプト。
// firebase-admin を使うため、GOOGLE_APPLICATION_CREDENTIALS にサービスアカウント鍵を指定して実行する。
//   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json npm run seed

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error("GOOGLE_APPLICATION_CREDENTIALS が未設定です");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// 架空・汎用のサンプル（特定企業のレイアウトではない）
const resources = [
  { name: "Meeting Room A", type: "meeting_room", capacity: 6, location: "3F", active: true },
  { name: "Meeting Room B", type: "meeting_room", capacity: 4, location: "3F", active: true },
  { name: "Meeting Room C", type: "meeting_room", capacity: 10, location: "4F", active: true },
  { name: "Phone Booth 1", type: "phone_booth", capacity: 1, location: "3F", active: true },
  { name: "Phone Booth 2", type: "phone_booth", capacity: 1, location: "4F", active: true },
];

async function main() {
  const col = db.collection("resources");
  for (const r of resources) {
    await col.add(r);
    console.log(`added: ${r.name}`);
  }
  console.log(`\n${resources.length} resources seeded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
