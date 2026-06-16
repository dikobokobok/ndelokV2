# Product Specification: ndelok

## Register
product

## Users
Sistem administrator, *backend developers*, dan IT *operators* yang membutuhkan visualisasi kesehatan server secara instan, pengelolaan *resource* secara intensif, serta pembacaan log secara cepat tanpa distorsi visual.

## Product Purpose
Sebuah konsol monitoring dan manajemen server berbasis **Neubrutalism** (`ndelok`). Aplikasi ini menolak estetika dashboard komersial konvensional yang monoton, menggantinya dengan struktur tata letak ber-kontras tinggi yang mempertegas fungsi. `ndelok` menyajikan metrik *real-time* (CPU, RAM, penyimpanan, jaringan) berdampingan dengan kakas pengembang tingkat lanjut: ekosistem plugin, alur kerja *deployment* proyek, *file explorer* yang kokoh, serta terminal performa tinggi. Dilengkapi dengan asisten AI DevOps bawaan yang distilisasi secara kontras.

---

## Features

- **Dashboard Utama**: Visualisasi *real-time* beban CPU, penggunaan RAM, sisa kapasitas Storage, dan kecepatan jaringan melalui blok metrik bertenaga pop-art dengan angka makro yang dominan.
- **Plugins Marketplace**: Galeri modul ekstensi sistem yang dikemas dalam bentuk kartu-kartu Neobrutalist ber-border tebal (`3px solid #000`) yang mudah dipindai.
- **Project Deployment**: Alur kerja linier terstruktur untuk meluncurkan dan mengelola aplikasi tanpa langkah kosmetik yang menyembunyikan proses asli.
- **File Explorer**: Antarmuka manajemen berkas server dengan grid terekspos (*exposed grids*) yang mekanikal, jujur, dan konsisten.
- **Logs & Terminal**: Aliran log sistem *high-readability* menggunakan font monospace murni berlatar gelap pekat atau putih kontras, meminimalkan kelelahan mata saat proses *debugging*.
- **Settings**: Konfigurasi sistem dan parameter antarmuka yang diatur dalam form kontrol Neobrutalist (input kotak tajam, *checkbox* border tebal, tanpa radius).
- **AI Agent Overlay**: Komponen melayang (*floating*) persisten dengan *hard shadow* tebal berwarna aksen khusus yang bertindak sebagai komandan otomatisasi DevOps.

---

## Brand Personality
**Bold, Functional, Raw, dan High-Impact.** `ndelok` bangga akan kompleksitasnya dan menolak bersembunyi di balik estetika minimalis yang generik. Karakter aplikasinya tegas, lugas, menggunakan garis batas yang tebal, warna datar yang berani, dan interaksi fisik yang memuaskan. Ini adalah alat kerja berkinerja tinggi untuk para profesional yang menginginkan kejelasan absolut.

## Anti-references
Dashboard SaaS generik pada umumnya: tata letak yang terlalu padat dan sempit, kartu di dalam kartu (*nested cards*) yang bertumpuk halus, teks abu-abu ber-kontras rendah, bayangan atmosferik yang pudar, serta gradien warna kosmetik yang mengaburkan kejelasan data.

---

## Design Principles (Prinsip Desain)

- **Explicit Structure Over Subtlety**: Kejelasan batas kontainer (*edge clarity*) dipulihkan lewat garis border hitam tebal. Antarmuka tidak menghilang dalam netralitas, ia menyatakan kehadirannya dengan tegas.
- **Data-First Visual Moat**: Angka metrik server dan status darurat adalah pahlawan utama halaman. Ukurannya masif, menggunakan bobot font maksimal (*heavy weight*), dan langsung memotong perhatian pengguna.
- **Structured Disruption**: Tata letak makro (seperti susunan kartu metrik hero dan modul AI) boleh sengaja digeser (*offset*) atau asimetris untuk menciptakan energi visual. Namun, tata letak mikro (seperti kolom input form, teks log, dan tombol aksi) wajib sinkron secara mekanikal pada grid demi mempertahankan kecepatan navigasi.

---

## Accessibility & Inclusion (Aksesibilitas & Kepatuhan)

Sistem `ndelok` dibangun mengacu pada standar **WCAG 2.2** (World Wide Web Consortium Recommendation):
- **Contrast Compliance**: Semua teks operasional, grafik, dan batas komponen interaktif wajib melebihi ambang batas kontras minimal `4.5:1` terhadap warna latar belakang datar. Palet warna yang "keras" dipastikan tidak mengorbankan aksesibilitas (misalnya: tidak menumpuk teks kuning di atas latar putih).
- **Non-Text Contrast (1.4.11)**: Batas *border* tebal `3px` menjamin penanda kontrol UI langsung teridentifikasi oleh pengguna dengan keterbatasan penglihatan (*low vision*).
- **Multi-Channel Signaling**: Status eror atau peringatan kritis tidak boleh hanya mengandalkan perubahan warna semata (melanggar WCAG 1.4.1). Setiap status wajib disertai teks keterangan yang jelas, perubahan ketebalan border, atau simbol ikonografi yang kontras.