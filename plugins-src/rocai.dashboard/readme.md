# RocAI Dashboard (rocai.dashboard)

Plugin runtime untuk RocAide yang membuka dashboard agent RocAI di dalam
aplikasi. Dashboard diambil dari gateway lokal `http://127.0.0.1:9119`
(uvicorn, tanpa header X-Frame-Options) dan ditampilkan sebagai iframe
pada halaman plugin.

## Cara pakai

1. Pastikan gateway RocAI aktif di Termux (port 9119).
2. Buka command palette di RocAide dan jalankan perintah
   `rocai.dashboard` ("Buka dashboard RocAI (:9119)").

## Catatan teknis

- Terpasang manual ke folder plugin RocAide (tanpa rebuild APK);
   `loadPlugins()` memindai isi folder dan memuat folder baru otomatis.
- Port 3030 tidak dipakai karena mengirim `X-Frame-Options: DENY`;
   port 3032 hanya CSP report-only.
- Status gateway di-poll tiap 5 detik; jika tidak terjangkau, status bar
  berubah merah dengan pesan penuntun.
