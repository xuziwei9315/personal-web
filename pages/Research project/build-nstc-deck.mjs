/**
 * 產生合併簡報：
 * - NSTC_project_ppt_deck.html：以 iframe 相對路徑載入各頁（相容性最佳，需與投影片檔同目錄）
 * - NSTC_project_ppt_deck_standalone.html：Base64 + Blob 單檔離線版
 *
 * 執行: node build-nstc-deck.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = __dirname;

const slideFiles = [
  "NSTC_project_ppt.html",
  ...[2, 3, 4, 5, 6, 7, 8, 9].map((n) => `NSTC_project_ppt copy ${n}.html`),
];

for (const name of slideFiles) {
  const p = path.join(dir, name);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing slide file: ${name}`);
  }
}

const slides = slideFiles.map((name) => fs.readFileSync(path.join(dir, name), "utf8"));
const b64 = slides.map((html) => Buffer.from(html, "utf8").toString("base64"));
const slidesB64Json = JSON.stringify(b64);
const slideFilesJson = JSON.stringify(slideFiles);

function deckHtml(embedded) {
  const loaderBlock = embedded
    ? `
    const SLIDE_B64 = ${slidesB64Json};
    function utf8FromB64(b64) {
      try {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        if (typeof TextDecoder !== "undefined") {
          return new TextDecoder("utf-8").decode(bytes);
        }
        return decodeURIComponent(escape(bin));
      } catch (e) {
        console.error(e);
        return "<!DOCTYPE html><html><body><p>無法載入此頁</p></body></html>";
      }
    }
    var slideBlobUrl = null;
    function revokeSlideBlob() {
      if (slideBlobUrl) {
        URL.revokeObjectURL(slideBlobUrl);
        slideBlobUrl = null;
      }
    }
    function loadSlideContent(i) {
      revokeSlideBlob();
      frame.removeAttribute("srcdoc");
      var html = utf8FromB64(SLIDE_B64[i]);
      try {
        slideBlobUrl = URL.createObjectURL(
          new Blob([html], { type: "text/html;charset=utf-8" })
        );
        frame.src = slideBlobUrl;
      } catch (err) {
        console.warn("Blob URL 失敗，改用 srcdoc", err);
        frame.removeAttribute("src");
        frame.srcdoc = html;
      }
    }
    window.addEventListener("pagehide", revokeSlideBlob);
`
    : `
    const SLIDE_FILES = ${slideFilesJson};
    function revokeSlideBlob() {}
    function loadSlideContent(i) {
      frame.removeAttribute("srcdoc");
      revokeSlideBlob();
      var name = SLIDE_FILES[i];
      frame.src = new URL(name, window.location.href).href;
    }
`;

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ICIM 2026 簡報（合併）${embedded ? " · 離線版" : ""}</title>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; overflow: hidden; }
    body {
      font-family: "Noto Sans TC", "Segoe UI", sans-serif;
      background: #020617;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
    }
    .deck-header {
      flex-shrink: 0;
      padding: 10px 16px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px 14px;
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    }
    .deck-back {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 10px;
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(96, 165, 250, 0.35);
      color: #e2e8f0;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
    }
    .deck-back:hover {
      background: rgba(59, 130, 246, 0.22);
      color: #f8fafc;
    }
    .deck-header-text {
      flex: 1 1 200px;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: right;
      gap: 2px;
    }
    @media (max-width: 520px) {
      .deck-header-text {
        align-items: flex-start;
        text-align: left;
        flex-basis: 100%;
      }
    }
    .deck-title {
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .deck-hint {
      font-size: 12px;
      color: #64748b;
      display: none;
    }
    @media (min-width: 640px) {
      .deck-hint { display: block; }
    }
    #viewport {
      flex: 1;
      min-height: 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
    }
    #sizeBox {
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
    }
    #scaler {
      width: 1280px;
      height: 720px;
      transform-origin: top left;
      position: absolute;
      top: 0;
      left: 0;
    }
    #slideFrame {
      display: block;
      width: 1280px;
      height: 720px;
      border: 0;
      background: #0f172a;
    }
    .frame-back-btn {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 30;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 10px;
      background: rgba(15, 23, 42, 0.82);
      border: 1px solid rgba(148, 163, 184, 0.45);
      color: #f1f5f9;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
      pointer-events: auto;
      backdrop-filter: blur(8px);
      -webkit-tap-highlight-color: transparent;
    }
    .frame-back-btn:hover {
      background: rgba(30, 41, 59, 0.92);
      border-color: rgba(96, 165, 250, 0.6);
      color: #fff;
    }
    .frame-back-btn:active {
      transform: scale(0.97);
    }
    .deck-nav {
      flex-shrink: 0;
      padding: 12px 16px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      background: rgba(15, 23, 42, 0.98);
      border-top: 1px solid rgba(148, 163, 184, 0.2);
    }
    .nav-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      max-width: 420px;
    }
    .nav-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      font-size: 15px;
      font-weight: 600;
      color: #f1f5f9;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .nav-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      box-shadow: none;
    }
    .nav-btn:not(:disabled):active {
      transform: scale(0.98);
    }
    #pageLabel {
      font-size: 13px;
      color: #94a3b8;
      font-variant-numeric: tabular-nums;
    }
  </style>
</head>
<body>
  <header class="deck-header">
    <a class="deck-back" href="NSTC_project.html"><i class="fas fa-arrow-left" aria-hidden="true"></i> 返回專案</a>
    <div class="deck-header-text">
      <span class="deck-title">大型語言模型應用在詐騙偵測之研究 · ICIM 2026</span>
      <span class="deck-hint">↑↓ 或 PgUp / PgDn 換頁${
        embedded ? "" : " · 請用本機伺服器開啟（勿用 file://）"
      }</span>
    </div>
  </header>
  <div id="viewport">
    <div id="sizeBox">
      <div id="scaler">
        <iframe id="slideFrame" title="簡報投影片"></iframe>
      </div>
      <a class="frame-back-btn" href="NSTC_project.html" aria-label="返回專案頁 NSTC_project.html">
        <i class="fas fa-arrow-left" aria-hidden="true"></i>
        <span>返回專案</span>
      </a>
    </div>
  </div>
  <nav class="deck-nav" aria-label="簡報換頁">
    <div class="nav-row">
      <button type="button" class="nav-btn" id="btnPrev" aria-label="上一頁">
        <i class="fas fa-chevron-up"></i> 上一頁
      </button>
      <button type="button" class="nav-btn" id="btnNext" aria-label="下一頁">
        下一頁 <i class="fas fa-chevron-down"></i>
      </button>
    </div>
    <span id="pageLabel"></span>
  </nav>
  <script>
    ${loaderBlock}
    const frame = document.getElementById("slideFrame");
    const sizeBox = document.getElementById("sizeBox");
    const scaler = document.getElementById("scaler");
    const viewport = document.getElementById("viewport");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const pageLabel = document.getElementById("pageLabel");
    const total = ${embedded ? "SLIDE_B64.length" : "SLIDE_FILES.length"};
    let index = 0;

    function applyScale() {
      const w = viewport.clientWidth;
      const h = viewport.clientHeight;
      const s = Math.min(w / 1280, h / 720, 1) * 0.995;
      sizeBox.style.width = 1280 * s + "px";
      sizeBox.style.height = 720 * s + "px";
      scaler.style.transform = "scale(" + s + ")";
    }

    function showSlide(i) {
      index = Math.max(0, Math.min(total - 1, i));
      loadSlideContent(index);
      btnPrev.disabled = index <= 0;
      btnNext.disabled = index >= total - 1;
      pageLabel.textContent = "第 " + (index + 1) + " / " + total + " 頁";
    }

    btnPrev.addEventListener("click", function () { showSlide(index - 1); });
    btnNext.addEventListener("click", function () { showSlide(index + 1); });

    window.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        showSlide(index - 1);
      } else if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        showSlide(index + 1);
      }
    });

    let touchY = null;
    viewport.addEventListener(
      "touchstart",
      function (e) {
        if (e.changedTouches.length === 1) touchY = e.changedTouches[0].clientY;
      },
      { passive: true }
    );
    viewport.addEventListener(
      "touchend",
      function (e) {
        if (touchY == null || e.changedTouches.length !== 1) return;
        const dy = e.changedTouches[0].clientY - touchY;
        touchY = null;
        if (dy > 50) showSlide(index - 1);
        else if (dy < -50) showSlide(index + 1);
      },
      { passive: true }
    );

    window.addEventListener("resize", applyScale);
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(applyScale).observe(viewport);
    }

    showSlide(0);
    requestAnimationFrame(applyScale);
  </script>
</body>
</html>
`;
}

fs.writeFileSync(path.join(dir, "NSTC_project_ppt_deck.html"), deckHtml(false), "utf8");
fs.writeFileSync(path.join(dir, "NSTC_project_ppt_deck_standalone.html"), deckHtml(true), "utf8");
console.log(
  "Wrote NSTC_project_ppt_deck.html (relative iframes), NSTC_project_ppt_deck_standalone.html (embed),",
  slideFiles.length,
  "slides each"
);
