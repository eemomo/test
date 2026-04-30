/**
 * Sub-Info Panel Script for Surge
 * 使用 HEAD 请求获取订阅流量信息，极低流量消耗
 * 
 * [Script]
 * Sub-Info = type=generic,script-path=sub-info.js,timeout=10,argument=https://你的订阅链接
 *
 * [Panel]
 * Sub-Info = script-name=Sub-Info,update-interval=86400
 */

const url = $argument;

if (!url) {
  $done({ title: "", content: "⚠️ 未设置订阅地址\n请在 argument 中填写订阅链接" });
}

$httpClient.head(
  {
    url,
    headers: { "User-Agent": "Quantumult%2FX" },
    timeout: 10,
  },
  (error, response, _body) => {
    if (error) {
      $done({ title: "", content: "❌ 请求失败\n" + error });
      return;
    }

    const info = response.headers["subscription-userinfo"]
      || response.headers["Subscription-Userinfo"]
      || "";

    if (!info) {
      $done({ title: "", content: "⚠️ 机场未返回流量信息\n该订阅可能不支持 subscription-userinfo" });
      return;
    }

    const get = (key) => {
      const match = info.match(new RegExp(key + "=(\\d+)"));
      return match ? parseInt(match[1], 10) : 0;
    };

    const upload   = get("upload");
    const download = get("download");
    const total    = get("total");
    const expire   = get("expire");

    const used = upload + download;
    const pct  = total ? (used / total * 100) : 0;

    const gb = (bytes) => {
      if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + " GB";
      if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(2) + " MB";
      return (bytes / 1024).toFixed(2) + " KB";
    };

    const buildBar = (p) => {
      const filled = Math.min(10, Math.round(p / 10));
      return "◼".repeat(filled) + "◻".repeat(10 - filled);
    };

    const bar = buildBar(pct);
    const pctStr = pct.toFixed(1) + "%";

    let expStr = "未知";
    if (expire) {
      const expDate = new Date(expire * 1000);
      expStr = expDate.toISOString().slice(0, 10);
      const daysLeft = Math.ceil((expDate - Date.now()) / 86400000);
      if (daysLeft <= 7) expStr += "  ⚠️";
    }

    const leftStr  = `到期 ${expStr}`;
    const rightStr = `已用 ${gb(used)}`;
    const middle   = " ".repeat(8);

    const content = [
      `${bar}  ${pctStr}`,
      `${leftStr}${middle}${rightStr}`,
    ].join("\n");

    $done({ title: "", content });
  }
);
