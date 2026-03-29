// 相対パスを絶対パスに変換する関数
export function toAbsoluteUrl(rootUrl: string, href: string): string {
  try {
    return new URL(href, rootUrl).toString();
  } catch {
    console.log("URLの変換に失敗しています");
    return href;
  }
}
