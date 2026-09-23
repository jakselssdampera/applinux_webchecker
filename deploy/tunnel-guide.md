# 🌐 Panduan Remote Access untuk Ubuntu Home Server

Panduan ini menjelaskan cara mengakses **WebSec Auditor & Stress Tester** yang berjalan di Home Server Anda dari luar rumah (internet) secara aman dan gratis.

---

## Masalah: Mengapa Port Forwarding Biasa Tidak Berfungsi?

Hampir seluruh ISP residensial/rumah di Indonesia (**IndiHome, Biznet Home, FirstMedia, MyRepublic, Oxygen, dll**) menggunakan teknologi **CGNAT (Carrier-Grade NAT)**:
- Router rumah Anda tidak memiliki IP Publik langsung, melainkan IP privat ISP (biasanya `100.64.x.x`).
- Mengubah pengaturan port forwarding di router rumah **tidak akan bisa diakses dari internet** karena terhalang router gateway ISP.

---

## Solusi 1: Cloudflare Tunnel (Sangat Direkomendasikan) 🏆

**Kelebihan**:
- ✅ Gratis 100% dari Cloudflare.
- ✅ Tidak memerlukan IP Publik Statis.
- ✅ Tidak perlu buka port apa pun di router rumah (bebas risiko port scanning).
- ✅ Otomatis mendapatkan sertifikat HTTPS/SSL gratis.
- ✅ Dilindungi oleh proteksi DDoS Cloudflare.

### Persyaratan:
1. Memiliki domain sendiri yang sudah terhubung ke Cloudflare (misal: `domainanda.com`).
2. Akun gratis di Cloudflare.

### Langkah-langkah Setup:

1. **Buka Dashboard Cloudflare Zero Trust**:
   - Masuk ke [one.dash.cloudflare.com](https://one.dash.cloudflare.com/).
   - Di menu sebelah kiri, klik **Networks > Tunnels**.
   - Klik tombol **Create a tunnel**.

2. **Beri Nama Tunnel**:
   - Beri nama tunnel, misalnya: `homeserver-websec`.
   - Klik **Save tunnel**.

3. **Install `cloudflared` di Ubuntu Server Anda**:
   - Pilih sistem operasi **Debian / Ubuntu**.
   - Pilih arsitektur CPU server Anda (umumnya **amd64** untuk PC/mini PC Intel/AMD, atau **arm64** untuk Raspberry Pi).
   - Cloudflare akan menampilkan satu baris perintah instalasi otomatis. Copy dan paste ke terminal Ubuntu Server Anda:
     ```bash
     # Contoh perintah dari Cloudflare:
     curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
     sudo dpkg -i cloudflared.deb
     sudo cloudflared service install <TOKEN_DARI_CLOUDFLARE>
     ```
   - Cloudflare dashboard akan mendeteksi status tunnel berubah menjadi **Active** (warna hijau). Klik **Next**.

4. **Konfigurasi Routing Domain**:
   - Masukkan subdomain yang diinginkan, misalnya:
     - **Subdomain**: `websec`
     - **Domain**: `domainanda.com`
     - *(Hasil alamat web nantinya: `https://websec.domainanda.com`)*
   - Di bagian **Service**:
     - **Type**: `HTTP`
     - **URL**: `localhost:3000`
   - Klik **Save Tunnel**.

5. **Selesai!**
   Buka `https://websec.domainanda.com` dari mana saja (HP, laptop di kantor, dll). Dashboard WebSec Auditor akan langsung terbuka dengan koneksi HTTPS yang aman!

---

## Solusi 2: Tailscale VPN (Akses Privat Tanpa Domain) 🔒

Jika Anda **tidak** ingin WebSec Auditor terbuka untuk publik dan hanya ingin Anda sendiri yang bisa mengakses dari HP / laptop di luar rumah:

### Langkah-langkah:
1. **Daftar akun gratis di [tailscale.com](https://tailscale.com/)**.
2. **Install Tailscale di Ubuntu Server**:
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up
   ```
   Buka link otentikasi yang muncul di terminal untuk menghubungkan server ke akun Tailscale Anda.
3. **Catat IP Tailscale Server**:
   Jalankan:
   ```bash
   tailscale ip -4
   # Contoh hasil: 100.85.22.40
   ```
4. **Install Tailscale di HP atau Laptop Anda**:
   - Download aplikasi Tailscale di iOS, Android, macOS, atau Windows.
   - Login dengan akun yang sama dan aktifkan VPN Tailscale.
5. **Akses Dashboard**:
   Buka browser di HP/laptop Anda dan akses:
   `http://100.85.22.40:3000` *(ganti dengan IP Tailscale server Anda)*.

---

## Ringkasan Perbandingan

| Fitur | Cloudflare Tunnel | Tailscale VPN |
|---|---|---|
| **Akses Publik via Domain** | Ya (`https://websec.domain.com`) | Tidak |
| **Perlu Domain Pribadi** | Ya | Tidak |
| **Perlu Install Aplikasi di Klien** | Tidak (cukup browser apa saja) | Ya (perlu app Tailscale) |
| **Keamanan** | Diproteksi Cloudflare Edge | Private VPN terenkripsi end-to-end |
