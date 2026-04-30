// 放入 Surge 脚本目录，例如 ~/Documents/Surge/Scripts/sub-info.js
const url = $argument;

if (!url) {
  $done({ title: "订阅信息", content: "未设置订阅地址" });
}

$httpClient.get({ url, headers: { "User-Agent": "Quantumult%2FX" } }, (e, r, body) => {
  if (e) { $done({ title: "错误", content: e }); return; }
  const info = r.headers["subscription-userinfo"] || "";
  const get = (k) => { const m = info.match(new RegExp(k + "=(\\d+)")); return m ? +m[1] : 0; };
  const [upload, download, total, expire] = ["upload","download","total","expire"].map(get);
  const gb = (b) => (b / 1024 ** 3).toFixed(2) + " GB";
  const used = upload + download;
  const left = total - used;
  const pct = total ? (used / total * 100).toFixed(1) : 0;
  const expStr = expire
    ? new Date(expire * 1000).toISOString().slice(0, 10)
    : "未知";
  const content = [
    `📊 已用：${gb(used)} / ${gb(total)} (${pct}%)`,
    `⬆ 上传：${gb(upload)}　⬇ 下载：${gb(download)}`,
    `📦 剩余：${gb(left)}`,
    `⏳ 到期：${expStr}`,
  ].join("\n");
  $done({ title: "订阅流量", content });
});