// https://inazuma-db.web.app/personnages よりビルドの抽出
// 開発者ツールより取得したデータが別ファイルに用意されていることを前提とする

const fs = require("fs");
const vm = require("vm");

const INPUT_FILE = "tmp.txt";
const OUTPUT_FILE = "tmp.id-nameJp-style.json";
const SOURCE_VARIABLE = "iF";
const FIELDS = ["id", "nameJp", "style"];

// ただの文字列として読み込む
const code = fs.readFileSync(INPUT_FILE, "utf8");
// 外部コードを安全に実行するための隔離環境
const sandbox = {
  n: (value) => value,
};

// コードを実行し、SOURCE_VARIABLEに格納されたデータをsandbox.__resultに保存する
vm.createContext(sandbox);
vm.runInContext(`${code}\nthis.__result = ${SOURCE_VARIABLE};`, sandbox, {
  timeout: 60000,
});

if (!Array.isArray(sandbox.__result)) {
  throw new Error("入力データは配列である必要があります。");
}

// 必要なフィールドだけ抽出
const extractedRecords = sandbox.__result.map((record) =>
  Object.fromEntries(FIELDS.map((field) => [field, record?.[field] ?? null])),
);

// JSONファイル出力
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(extractedRecords, null, 2));

console.log(`wrote ${extractedRecords.length} records to ${OUTPUT_FILE}`);
