// 日付フォーマット共通ユーティリティ
// 情報がない場合は空文字を返す（今日で埋めない）

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
}

// 実施日のみを表示（change_date優先、なければ空）
export function changeDateLabel(item: { change_date?: string | null }): string {
  return formatDate(item.change_date);
}

export function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return "不明";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "不明";
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const day = Math.floor(hr / 24);
  return `${day}日前`;
}
