# 📖 Panduan Lengkap Penggunaan WebSec Auditor & Stress Tester

> **WebSec Auditor & Stress Tester** adalah platform terintegrasi untuk pengujian keamanan dinamis (*Dynamic Application Security Testing / DAST*), simulasi eksploitasi aman (*Safe Exploit Simulation*), audit profil teknologi/WAF, pengujian ketahanan beban (*Stress/Load Testing*), serta analisis request interaktif (*Request Repeater Lab*).

---

## 📑 Daftar Isi

1. [Pernyataan Legalitas & Kepatuhan Etika](#1-pernyataan-legalitas--kepatuhan-etika)
2. [Cara Memulai & Menjalankan Aplikasi](#2-cara-memulai--menjalankan-aplikasi)
   - [A. Menjalankan di Komputer Lokal (Development)](#a-menjalankan-di-komputer-lokal-development)
   - [B. Menjalankan Mode Produksi](#b-menjalankan-mode-produksi)
   - [C. Menjalankan di Ubuntu Home Server (Docker)](#c-menjalankan-di-ubuntu-home-server-docker)
3. [Alur Otorisasi Pengguna (Authorization Consent)](#3-alur-otorisasi-pengguna-authorization-consent)
4. [Navigasi & Tata Letak Antarmuka (UI Layout)](#4-navigasi--tata-letak-antarmuka-ui-layout)
5. [Fungsi & Modul-Modul Utama](#5-fungsi--modul-modul-utama)
   - [Modul 1: Tech Profiler & WAF Detector](#modul-1-tech-profiler--waf-detector)
   - [Modul 2: Vulnerability Scanner (Crawler Otomatis)](#modul-2-vulnerability-scanner-crawler-otomatis)
   - [Modul 3: Exploit Simulator (PoC Aman)](#modul-3-exploit-simulator-poc-aman)
   - [Modul 4: Stress & Load Tester (Pengujian Kapasitas)](#modul-4-stress--load-tester-pengujian-kapasitas)
   - [Modul 5: Request Repeater Lab (Tampering Ala Burp Suite)](#modul-5-request-repeater-lab-tampering-ala-burp-suite)
   - [Modul 6: Executive Reporting & Cetak PDF](#modul-6-executive-reporting--cetak-pdf)
   - [Modul 7: Riwayat Scan & Audit Trail](#modul-7-riwayat-scan--audit-trail)
6. [Panduan Langkah Demi Langkah Skenario Penggunaan](#6-panduan-langkah-demi-langkah-skenario-penggunaan)
   - [Skenario A: Audit Keamanan Lengkap Website](#skenario-a-audit-keamanan-lengkap-website)
   - [Skenario B: Stress Testing Menghadapi Lonjakan Traffic](#skenario-b-stress-testing-menghadapi-lonjakan-traffic)
   - [Skenario C: Menguji Celah Form Login di Repeater Lab](#skenario-c-menguji-celah-form-login-di-repeater-lab)
7. [Mekanisme Proteksi & Guardrails Bawaan](#7-mekanisme-proteksi--guardrails-bawaan)
8. [Tanya Jawab & Troubleshooting (FAQ)](#8-tanya-jawab--troubleshooting-faq)

---

## 1. Pernyataan Legalitas & Kepatuhan Etika

⚠️ **PERINGATAN KERAS:**
Aplikasi ini dirancang khusus untuk **audit keamanan berizin (authorized security audit)**, penetration testing dengan persetujuan tertulis (*written consent*), dan riset ketahanan infrastruktur mandiri.

- Dilarang memindai atau menyerang sistem, domain, atau IP tanpa izin tertulis dari pemilik sistem.
- Tindakan pemindaian atau penyerangan tanpa izin merupakan pelanggaran hukum (UU ITE di Indonesia atau Computer Fraud and Abuse Act internasional).
- Setiap aksi pemindaian yang dilakukan melalui aplikasi ini akan **dicatat secara permanen** pada berkas audit log (*Dual Audit Logging: SQLite + JSONL*) demi akuntabilitas hukum.

---

## 2. Cara Memulai & Menjalankan Aplikasi

Aplikasi dapat dijalankan melalui beberapa mode sesuai lingkungan Anda:

### A. Menjalankan di Komputer Lokal (Development)
Pastikan Anda telah menginstal **Node.js v20+**:
```bash
# 1. Masuk ke direktori aplikasi
cd "d:/Linux/App Linux"

# 2. Pasang dependensi
npm install

# 3. Jalankan server development
npm run dev
```
Buka browser dan akses: `http://localhost:3000`

---

### B. Menjalankan Mode Produksi
Untuk performa optimal tanpa overhead live-reloader:
```bash
# Kompilasi bundle dengan esbuild
npm run build

# Jalankan server produksi
npm start
```

---

### C. Menjalankan di Ubuntu Home Server (Docker)
Jika Anda menggunakan Home Server dengan Ubuntu Server:
```bash
# Di terminal Ubuntu Server:
git clone https://github.com/jakselssdampera/applinux_webchecker.git
cd applinux_webchecker

# Buat folder data persisten
mkdir -p data/audit-logs
chmod -R 777 data

# Jalankan container di background
docker compose up -d --build
```
Aplikasi dapat diakses oleh perangkat lain di jaringan Wi-Fi rumah via `http://<IP-UBUNTU-SERVER>:3000`.

---

## 3. Alur Otorisasi Pengguna (Authorization Consent)

Saat pertama kali membuka dashboard, aplikasi akan menampilkan **Modal Otorisasi Hukum (Authorization Required)**:

![Authorization Modal](public/css/style.css)

1. Baca peringatan etika dan tanggung jawab hukum.
2. Centang kotak persetujuan:  
   ☑️ *"I confirm that I have legal authorization to test the target systems"*.
3. Klik tombol **`🔒 I Agree & Continue`**.
4. Sistem backend akan mencatat waktu persetujuan ke tabel `audit_logs` dan menerbitkan cookie terenkripsi (`websec_consent`).
5. Modal akan tertutup dan Anda dapat menggunakan seluruh fitur aplikasi.

> 💡 *Catatan:* Jika cookie dihapus atau Anda mengakses dari browser/perangkat baru, modal ini akan muncul kembali demi kepatuhan keamanan.

---

## 4. Navigasi & Tata Letak Antarmuka (UI Layout)

Antarmuka web mengusung gaya modern **Dark Cyberpunk Glassmorphism** yang responsif dan terbagi atas beberapa area utama:

- **Sidebar Kiri**:
  - 🛡️ **WebSec Auditor**: Identitas & logo platform.
  - 🎯 **Security Scanner (`#/`)**: Formulir scan utama dan hasil analisis komprehensif.
  - 🧪 **Repeater Lab (`#/repeater`)**: Editor manual untuk modifikasi dan injeksi HTTP request.
  - 📜 **Scan History (`#/history`)**: Daftar riwayat pemindaian terdahulu beserta status dan skornya.
  - 🟢 **Live Status & Engine Health**: Indikator status koneksi WebSocket dan pemakaian memori server.
- **Header Atas**:
  - Tombol **Quick New Scan**: Cepat kembali ke formulir pengujian.
  - Indikator koneksi WebSocket real-time (`Connected` / `Reconnecting`).
- **Main View Area**: Menampilkan formulir scan, progress bar dinamis saat scan berlangsung, kartu-kartu hasil analisis, atau antarmuka Request Repeater.

---

## 5. Fungsi & Modul-Modul Utama

Berikut rincian lengkap fungsi dan kapabilitas dari setiap modul pengujian:

---

### Modul 1: Tech Profiler & WAF Detector
*Fungsi: Mengidentifikasi "sidik jari" (fingerprint) infrastruktur web target dan mengevaluasi konfigurasi header keamanannya.*

#### Fitur Utama:
- **Deteksi Web Application Firewall (WAF)**:
  Mendeteksi keberadaan firewall modern seperti **Cloudflare, AWS WAF, Akamai, Imperva Incapsula, Fastly, Sucuri, F5 BIG-IP, ModSecurity**, dll.
- **Deteksi Teknologi & Framework**:
  Mengenali 30+ teknologi:
  - *Web Server*: Nginx, Apache, Caddy, IIS, LiteSpeed.
  - *Backend & CMS*: PHP, Laravel, Node.js, Express, Next.js, Django, WordPress, Drupal, Joomla, Ruby on Rails, ASP.NET.
  - *Frontend Framework*: React, Vue.js, Angular, Alpine.js, Tailwind.
- **Audit Security Headers & Skor Keamanan (Grade A s/d F)**:
  Mengevaluasi keberadaan dan konfigurasi header wajib:
  - `Content-Security-Policy (CSP)`
  - `Strict-Transport-Security (HSTS)`
  - `X-Frame-Options` (perlindungan Clickjacking)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy` & `Permissions-Policy`
- **Pemeriksaan File & Direktori Sensitif Terbuka**:
  Mengecek keberadaan file risiko tinggi seperti `/.env`, `/.git/HEAD`, `/robots.txt`, `/phpinfo.php`, `/wp-config.php.bak`, dll.

---

### Modul 2: Vulnerability Scanner (Crawler Otomatis)
*Fungsi: Menjelajahi halaman-halaman web target secara otomatis dan mencari celah kerentanan kritis pada endpoint dan parameter input.*

#### Jenis Celah yang Dideteksi:
1. **SQL Injection (SQLi)**:
   - *Error-Based*: Mendeteksi kebocoran sintaks SQL database (MySQL, PostgreSQL, Oracle, SQLite, MSSQL).
   - *Boolean-Based & Arithmetic Inference*: Membandingkan respons logika `1=1` vs `1=2`.
   - *Time-Based Blind SQLi*: Mengukur jeda waktu respons menggunakan perintah sleep aman.
2. **Reflected Cross-Site Scripting (XSS)**:
   - Menguji apakah parameter URL atau input form memantulkan karakter HTML berbahaya tanpa sanitasi/encoding.
3. **Directory Traversal / Local File Inclusion (LFI)**:
   - Mendeteksi akses ke file sistem (seperti `../../../../etc/passwd` atau `win.ini`).
4. **Server Misconfiguration**:
   - Mendeteksi *Directory Listing* yang terbuka, server version disclosure, dan endpoint debug.
5. **Open Redirect**:
   - Mendeteksi manipulasi parameter pengalihan URL yang tidak divalidasi.

#### Klasifikasi Keparahan (*Severity Level*):
- 🔴 **CRITICAL**: Eksekusi kode, SQL Injection dengan potensi kebocoran data penuh.
- 🟠 **HIGH**: Cross-Site Scripting (XSS) tersimpan/tereksploitasi, akses file internal sensitif.
- 🟡 **MEDIUM**: Misconfiguration header, information disclosure, missing CSRF token.
- 🔵 **LOW**: Versi server terekspos, rekomendasi best-practice hardening.

Setiap temuan dilengkapi dengan referensi **CWE ID** (Common Weakness Enumeration) resmi.

---

### Modul 3: Exploit Simulator (PoC Aman)
*Fungsi: Memvalidasi apakah celah yang ditemukan benar-benar dapat dieksploitasi (eksploitasi bukti konsep / Proof of Concept) secara NON-DESTRUKTIF.*

#### Mengapa Aman (*Safe PoC*)?
- **Tanpa Drop/Ubah Data**: Tidak menjalankan `DROP TABLE`, `UPDATE`, atau `DELETE`.
- **Canary Token Verification**: Menggunakan token unik (misalnya `WSA_CANARY_SQLI_8923` atau `WSA_XSS_VERIFIED_7741`) untuk memastikan eksploitasi berhasil tanpa merusak halaman.
- **Console Log Only untuk XSS**: Menguji eksekusi JavaScript hanya melalui `console.log()` tanpa memunculkan alert popup yang mengganggu pengguna lain.

#### Output yang Dihasilkan:
- **Status Eksploitasi**: *Verified Vulnerable* atau *Protected / Mitigated*.
- **Perintah cURL Siap Pakai**: Tombol satu klik untuk menyalin perintah cURL terminal agar tim developer dapat mereproduksi temuan secara mandiri.
- **Rekomendasi Remediasi**: Panduan perbaikan kode (contoh: implementasi *Prepared Statements* untuk SQLi atau *Context-aware Escaping* untuk XSS).

---

### Modul 4: Stress & Load Tester (Pengujian Kapasitas)
*Fungsi: Menguji ketahanan, konkurensi, dan batasan batas beban (*capacity threshold*) dari server web target.*

#### Parameter yang Dapat Disesuaikan:
- **Concurrency (Virtual Users)**: Jumlah koneksi HTTP paralel yang dikirim bersamaan (misal: 10, 25, 50 koneksi simultan).
- **Duration (Detik)**: Lama waktu pengujian berlangsung (misal: 10 detik s/d 60 detik).
- **Target RPS (Requests Per Second)**: Batas kecepatan pengiriman paket per detik (atau tanpa batas untuk saturasi penuh).
- **HTTP Method**: Pengujian berbasis `GET`, `POST`, `HEAD`, dll.

#### Metrik Analisis Real-Time:
- **Total Requests**: Jumlah keseluruhan permintaan yang berhasil terkirim.
- **Success vs Error Rate**: Persentase respons sukses (2xx/3xx) vs error (4xx/5xx/timeout).
- **Distribusi Latensi Respons**:
  - `p50 (Median)`: Kecepatan rata-rata 50% pengguna.
  - `p95`: Batas latensi untuk 95% pengguna.
  - `p99 (Worst Case)`: Latensi terburuk saat server mulai jenuh.
- **HTTP Status Code Breakdown**: Grafik perbandingan respons `200 OK`, `429 Too Many Requests` (Rate Limiting), `500 Server Error`, dan `502/504 Bad Gateway`.

---

### Modul 5: Request Repeater Lab (Tampering Ala Burp Suite)
*Fungsi: Fasilitas interaktif untuk menguji, memanipulasi, dan mengirim ulang satu permintaan HTTP secara presisi.*

Dapat diakses melalui menu **Repeater Lab (`#/repeater`)** di sidebar.

#### Fitur-Fitur Repeater:
1. **HTTP Method & URL Bar**:
   Mendukung method `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
2. **Payload Injection Quick-Select**:
   Menu dropdown berisi koleksi payload siap pakai:
   - *SQLi*: Boolean tautology (`' OR 1=1 --`), UNION Canary, Time Sleep.
   - *XSS*: Script Canary, SVG onload, IMG onerror.
   - *Traversal*: `../../../../etc/passwd`, `..\\..\\win.ini`.
   - Tombol **Insert**: Menyisipkan payload langsung ke posisi kursor di URL atau Request Body.
3. **Custom Headers Editor**:
   Menambah atau memodifikasi header kustom (misal: `Authorization: Bearer <token>`, `Cookie: session=...`, `X-Forwarded-For`).
4. **Request Body Editor**:
   Mendukung format `JSON`, `application/x-www-form-urlencoded`, `multipart/form-data`, atau teks mentah.
5. **Response Inspector**:
   - **Status Badge**: Menampilkan status HTTP (contoh: `200 OK`, `403 Forbidden`) dan waktu respons (*latency*) dalam milidetik.
   - **Tab Body**: Tampilan sintaks respons yang rapi (*highlighted JSON/HTML*).
   - **Tab Headers**: Daftar seluruh header respons yang dikembalikan server.

---

### Modul 6: Executive Reporting & Cetak PDF
*Fungsi: Mengubah seluruh data teknis hasil audit menjadi dokumen laporan resmi yang siap dipresentasikan kepada manajemen atau klien.*

#### Fitur Laporan:
- **Executive Summary**: Ringkasan kondisi keamanan dalam bahasa non-teknis.
- **Security Score & Grade**: Nilai keamanan agregat (0 s/d 100) dan Grade (A, B, C, D, F).
- **Matriks Risiko Temuan**: Diagram jumlah temuan berdasarkan tingkat keparahan.
- **Rincian Teknis & Bukti Celah**: Menampilkan URL target, parameter rentan, payload yang berhasil, dan screenshot/log respon.
- **Prioritized Remediation Checklist**: Daftar tindakan perbaikan terurut dari yang paling mendesak.
- **Tombol Print / Export PDF**: Format CSS cetak yang rapi tanpa elemen sidebar/tombol navigasi yang mengganggu.

---

### Modul 7: Riwayat Scan & Audit Trail
*Fungsi: Melacak seluruh riwayat pengujian masa lalu dan mematuhi kepatuhan audit forensik.*

- **Halaman Riwayat (`#/history`)**:
  Menampilkan tabel pemindaian sebelumnya: Target URL, waktu pelaksanaan, modul yang diaktifkan, jumlah temuan, skor akhir, dan tautan untuk membuka kembali hasil audit.
- **Penyimpanan Lokal Mandiri**:
  Seluruh data scan tersimpan dalam SQLite database (`data/websec.db`) lokal server Anda, tidak ada data yang dikirim ke cloud pihak ketiga.
- **Audit Logs (`data/audit-logs/`)**:
  Catatan teks terperinci berisi alamat IP penguji, URL target, modul yang dijalankan, dan tanda waktu (*timestamp* ISO 8601).

---

## 6. Panduan Langkah Demi Langkah Skenario Penggunaan

### Skenario A: Audit Keamanan Lengkap Website

1. Buka dashboard di `http://localhost:3000` (atau IP server Anda).
2. Di formulir **Security Audit & Stress Configuration**:
   - Masukkan **Target URL**: contoh `https://example.com` (pastikan menyertakan `http://` atau `https://`).
   - Pilih **Scan Mode**:
     - *Quick Scan*: Profiler + pengecekan celah dasar (cepat, ~15-30 detik).
     - *Full Audit (Direkomendasikan)*: Menjalankan Profiler, Crawler multi-halaman, Deteksi SQLi/XSS, dan Exploit Sim.
   - Pada bagian **Select Modules to Run**, centang:
     - ☑️ *Tech Profiler & WAF*
     - ☑️ *Vulnerability Scanner*
     - ☑️ *Safe Exploit Simulation*
3. (Opsional) Tambahkan Header Kustom jika website memerlukan otentikasi login:
   - Contoh: `Authorization: Bearer eyJhbGciOi...` atau `Cookie: session_id=xyz`.
4. Klik tombol **`🚀 Start Security Audit`**.
5. Amati progress bar real-time saat modul-modul bekerja:
   - Status log akan muncul secara berurutan: *Target profiling completed* ➔ *Crawled 12 endpoints* ➔ *Scanning for vulnerabilities* ➔ *Simulating safe exploits*.
6. Setelah selesai, tinjau kartu hasil:
   - Tab **Technology & WAF**: Lihat web server dan skor keamanan header.
   - Tab **Vulnerabilities**: Periksa daftar celah yang terdeteksi beserta tingkat keparahannya.
   - Tab **Exploit Proof-of-Concept**: Uji coba verifikasi bukti konsep dan salin perintah cURL perbaikan.
7. Klik tombol **`📄 Generate PDF / Executive Report`** di pojok kanan atas untuk membuka laporan formal, lalu gunakan tombol cetak browser (`Ctrl + P`) untuk menyimpannya sebagai file PDF.

---

### Skenario B: Stress Testing Menghadapi Lonjakan Traffic

1. Buka formulir pemindaian utama.
2. Masukkan URL endpoint yang ingin diuji ketahanannya (contoh: `https://example.com/api/products`).
3. Pada opsi modul:
   - Hilangkan centang modul lain jika Anda hanya ingin menguji beban server.
   - Centang ☑️ **Stress & Load Tester**.
4. Atur parameter beban di panel **Stress Test Configuration**:
   - **Virtual Users / Concurrency**: `20` (20 pengguna bersamaan).
   - **Duration**: `15` detik.
   - **Target RPS Limit**: Kosongkan (unlimited) atau isi `100` untuk batas 100 permintaan/detik.
5. Klik **`🚀 Start Security Audit`**.
6. Perhatikan grafik metrik stres yang diperbarui secara langsung (*live streaming*):
   - Lihat apakah latensi respons mengalami lonjakan drastis (*spike*).
   - Perhatikan apakah server mengembalikan kode status `429` (Rate Limiting bekerja dengan baik) atau `502/504` (server kewalahan).
7. Tinjau kesimpulan statistik: Total requests terkirim, latensi p95, dan persentase error.

---

### Skenario C: Menguji Celah Form Login di Repeater Lab

1. Klik menu **🧪 Repeater Lab** pada sidebar.
2. Di bilah atas:
   - Ubah method HTTP menjadi **`POST`**.
   - Masukkan URL target: `https://example.com/api/login`.
3. Di tab **Headers**:
   - Pastikan terdapat header: `Content-Type: application/json`.
4. Di tab **Request Body**:
   - Ketikkan struktur JSON login awal:
     ```json
     {
       "username": "admin",
       "password": "password123"
     }
     ```
5. Untuk menguji SQL Injection:
   - Letakkan kursor setelah kata `"admin"`.
   - Buka menu dropdown **Quick Payloads** dan pilih: `Classic Boolean Tautology (' OR 1=1)`.
   - Klik tombol **`Insert`**. Body kini menjadi:
     ```json
     {
       "username": "admin' OR 1=1 --",
       "password": "password123"
     }
     ```
6. Klik tombol biru **`⚡ Send Request`**.
7. Perhatikan panel **Response**:
   - Tinjau status HTTP yang dihasilkan (misal `200 OK` vs `401 Unauthorized`).
   - Periksa waktu latensi respons dan isi body respons untuk melihat apakah autentikasi berhasil dilewati atau pesan error database terekspos.

---

## 7. Mekanisme Proteksi & Guardrails Bawaan

WebSec Auditor dilengkapi dengan sistem pertahanan internal untuk mencegah penyalahgunaan dan kegagalan sistem:

| Proteksi | Mekanisme Kerja | Manfaat |
|---|---|---|
| **SSRF Guardrail** | Memblokir target URL yang mengarah ke IP privat (`127.0.0.1`, `localhost`, `10.x.x.x`, `192.168.x.x`, `169.254.x.x`, dll.). | Mencegah penyerang memanfaatkan server ini untuk menyerang infrastruktur lokal/internal intranet. |
| **Safe Exploit Guarantee** | Seluruh payload eksploitasi otomatis hanya berupa verifikasi matematika (`1=1`), token canary reflection, atau safe delay. | Menjamin database target tidak terhapus, terubah, atau mengalami kerusakan data saat audit berlangsung. |
| **Dual Audit Logging** | Setiap eksekusi scan dicatat ganda: ke database SQLite dan berkas teks append-only `.jsonl`. | Memastikan tersedianya jejak audit forensik yang tidak dapat dimanipulasi jika terjadi sengketa hukum. |
| **AES-256-GCM Encryption** | Data sensitif dienkripsi dengan salt acak 16-byte dan kunci turunan Scrypt. | Menjamin kerahasiaan konfigurasi dan credential audit yang tersimpan di sistem. |

---

## 8. Tanya Jawab & Troubleshooting (FAQ)

### Q1: Muncul pesan error "SSRF Blocked: Scanning private/internal IPs is forbidden"
> **Penyebab**: Anda memasukkan URL target yang mengarah ke localhost (`127.0.0.1`, `localhost`, atau IP jaringan lokal rumah seperti `192.168.1.x`).  
> **Solusi**: Demi alasan keamanan, pengujian hanya diizinkan untuk target URL publik (*Public FQDN / Public IP*). Gunakan domain publik atau tunneling (misal via Cloudflare Tunnel) jika ingin menguji aplikasi lokal.

### Q2: Muncul pesan "Consent Failed: signer.sign is not a function"
> **Solusi**: Masalah ini telah diperbaiki di versi terbaru dengan perbaikan validasi `COOKIE_SECRET` dan pembungkusan plugin Fastify. Pastikan Anda telah melakukan `git pull origin main` dan restart aplikasi.

### Q3: Mengapa proses scan berhenti di tengah jalan?
> **Penyebab**: Server target mungkin memiliki Web Application Firewall (WAF) aktif yang memblokir alamat IP Anda sementara karena mendeteksi pola scanning otomatis, atau target mengalami timeout.  
> **Solusi**: Coba gunakan mode **Quick Scan**, kurangi intensitas konkurensi, atau tambahkan header custom `User-Agent` yang sah di formulir scan.

### Q4: Apakah data hasil audit saya diunggah ke internet?
> **Jawaban**: **Sama sekali tidak.** WebSec Auditor adalah aplikasi 100% *self-hosted*. Database SQLite, log audit, dan riwayat scan hanya tersimpan di komputer/server tempat Anda menjalankan aplikasi.

### Q5: Bagaimana cara memperbarui aplikasi ke versi terbaru?
> Cukup jalankan perintah git pull:
> ```bash
> git pull origin main
> npm run build
> # atau jika menggunakan Docker di Ubuntu:
> ./deploy/update.sh
> ```

---

*Dokumen ini disusun untuk memudahkan pengguna dan security engineer dalam mengoperasikan WebSec Auditor secara aman, efektif, dan profesional.*
