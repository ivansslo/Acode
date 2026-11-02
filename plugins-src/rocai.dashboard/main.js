/**
 * RocAI Dashboard — plugin runtime untuk RocAide (fork Acode).
 * Membuka dashboard agent RocAI (gateway :9119) di dalam aplikasi
 * sebagai halaman berisi iframe.
 *
 * Target: http://127.0.0.1:9119 — server uvicorn TANPA header
 * X-Frame-Options, sehingga dapat di-iframe. Port 3030 (WebUI) dan
 * 3032 (watchdog) tidak dipakai: 3030 mengirim XFO DENY, 3032 hanya
 * CSP report-only.
 *
 * Terpasang manual ke /sdcard/Android/data/com.foxdebug.acode/files/plugins/
 * tanpa rebuild APK — loadPlugins() memindai isi folder PLUGIN_DIR.
 */
(function () {
  "use strict";

  const PLUGIN_ID = "rocai.dashboard";
  const DASHBOARD_URL = "http://127.0.0.1:9119";
  const HEALTH_PATH = "/api/health";
  const POLL_INTERVAL = 5000;

  let pollTimer = null;
  let statusEl = null;
  let iframeEl = null;

  /** Cek hidup gateway :9119 dari dalam app (same-origin policy tidak
   *  berlaku untuk fetch lintas origin — mode no-cors dipakai agar
   *  status jaringan bisa dipakai sebagai indikator sederhana). */
  function checkGateway() {
    if (!statusEl) return;
    fetch(DASHBOARD_URL + HEALTH_PATH, { mode: "no-cors" })
      .then(function () {
        statusEl.textContent = "gateway :9119 aktif";
        statusEl.style.color = "";
      })
      .catch(function () {
        statusEl.textContent = "gateway :9119 tidak terjangkau — jalankan ulang server di Termux";
        statusEl.style.color = "#e53935";
      });
  }

  /** Bangun halaman plugin: status bar + iframe dashboard. */
  function buildPage($page) {
    statusEl = document.createElement("div");
    statusEl.style.cssText =
      "padding:8px 12px;font-size:12px;color:var(--primary-text,#888);" +
      "border-bottom:1px solid rgba(128,128,128,.2);";

    iframeEl = document.createElement("iframe");
    iframeEl.setAttribute("src", DASHBOARD_URL);
    iframeEl.setAttribute("frameborder", "0");
    iframeEl.style.cssText =
      "width:100%;height:calc(100% - 34px);border:0;display:block;background:#fff;";
    iframeEl.setAttribute(
      "allow",
      "clipboard-read; clipboard-write; fullscreen"
    );

    $page.append(statusEl);
    $page.append(iframeEl);
  }

  acode.setPluginInit(PLUGIN_ID, function ($baseUrl, $page, options) {
    buildPage($page);

    // Command palette: buka dashboard dari mana saja.
    acode.addCommand({
      name: PLUGIN_ID,
      description: "Buka dashboard RocAI (:9119)",
      readOnly: true,
      run: function () {
        if (typeof $page.show === "function") $page.show();
      },
    });

    // Sonde pertama + polling berkala selama plugin aktif.
    checkGateway();
    pollTimer = setInterval(checkGateway, POLL_INTERVAL);

    // Catat marker ke cache file plugin (verifikasi pasca-instal).
    try {
      if (options && options.cacheFile) {
        options.cacheFile.writeFile(
          JSON.stringify({
            plugin: PLUGIN_ID,
            loadedAt: new Date().toISOString(),
            target: DASHBOARD_URL,
          })
        );
      }
    } catch (e) {
      /* cache opsional */
    }
  });

  acode.setPluginUnmount(PLUGIN_ID, function () {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    acode.removeCommand(PLUGIN_ID);
    statusEl = null;
    iframeEl = null;
  });
})();
