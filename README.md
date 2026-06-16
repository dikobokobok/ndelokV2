# ndelok 🖥️ (Server Console) — v0.18.0 Beta

`ndelok` adalah sebuah konsol monitoring dan manajemen server berbasis estetika **Neubrutalism**. Aplikasi ini menolak gaya dashboard SaaS modern yang monoton (minim gradien, tanpa sudut melengkung halus, tanpa bayangan pudar), menggantinya dengan antarmuka datar ber-kontras tinggi dengan batas hitam tebal (*thick borders*) dan bayangan tegas (*hard shadows*) untuk mempertegas kejelasan fungsi data.

---

## ✨ Fitur Utama

- **Dashboard Real-time**: Monitor beban CPU, penggunaan RAM, kapasitas Storage, dan throughput Network dengan angka makro masif.
- **Grafik CPU Real-time**: Grafik garis (*line chart*) Neobrutalist dinamis yang digambar menggunakan inline SVG dengan fill kuning pop-art untuk melacak fluktuasi beban CPU selama 20 detik terakhir.
- **Hardware Spec Badges**: Informasi spesifikasi perangkat keras (seperti model prosesor, ukuran RAM ECC, dan tipe NVMe SSD) tersemat di sudut bawah setiap kartu metrik.
- **Exposed Structure Terminal & Logs**: Tabel log server dengan legibilitas tinggi menggunakan tipe huruf monospace terstruktur.
- **Settings & Control Form**: Elemen formulir Neobrutalist kaku (tanpa radius sudut) untuk kepraktisan operasional.

---

## 🎨 Panduan Desain & Tipografi (Neubrutalist Typography)

Mengacu pada prinsip Neobrutalism yang membedakan secara kontras antara huruf display/heading yang lantang dengan huruf body yang tenang demi legibilitas:

1. **Role: Display (`Bebas Neue` & `Syne`)**  
   Digunakan untuk momen impresi pertama dan visualisasi metrik makro. Memiliki karakter tegak, condensed, atau sangat lebar untuk dominasi halaman.
2. **Role: Heading (`Space Grotesk`)**  
   Digunakan untuk judul kartu, menu navigasi, dan judul halaman. Memberikan kepribadian geometris yang mekanikal.
3. **Role: Body (`Inter`)**  
   Sebagai penyeimbang yang tenang untuk deskripsi, salinan operasional, dan teks paragraf agar mata tidak lelah.
4. **Role: Monospace (`Space Mono`)**  
   Digunakan untuk label metrik, token sistem, timestamps, dan log server untuk menegaskan struktur mekanis data.

---

## 📁 Struktur Proyek

Aplikasi dikemas dengan pemisahan folder frontend yang rapi:
```text
ndelok/
├── frontend/           # Aplikasi frontend utama (Vite + React + TypeScript)
│   ├── src/
│   │   ├── App.tsx     # Komponen Dashboard utama dan logika monitoring
│   │   ├── main.tsx    # Entri React DOM
│   │   └── index.css   # Loading Google Fonts dan variabel CSS Neobrutalist
│   ├── index.html
│   ├── vite.config.ts  # Port default dikunci ke 1234
│   └── package.json
├── DESIGN.md           # Acuan Token Desain dan CSS Custom Properties
├── PRODUCT.md          # Spesifikasi Produk dan Aksesibilitas WCAG 2.2
├── package.json        # package.json di root (Proxy perintah npm ke subfolder)
└── README.md           # Berkas ini
```

---

## 🚀 Cara Menjalankan Aplikasi

Pastikan Node.js dan npm telah terinstal. Jalankan seluruh perintah berikut dari **direktori root** (`ndelok/`):

### 1. Memasang Dependensi
Lakukan instalasi dependensi di subfolder frontend:
```bash
npm install --prefix frontend
```

### 2. Menjalankan Server Pengembangan (Dev Mode)
Jalankan dev server dengan port default `1234`:
```bash
npm run dev
```
Buka peramban (browser) di alamat: **[http://localhost:1234](http://localhost:1234)**

### 3. Membuat Build Produksi
Kompilasi kode sumber TypeScript dan bundel aset statis siap deploy ke folder `frontend/dist`:
```bash
npm run build
```

---

## 🛠️ Tech Stack & Spesifikasi

- **Framework**: Pure client-side **React 19**
- **Build Tool**: **Vite 6**
- **Language**: **TypeScript 5**
- **Aesthetic**: Vanilla CSS (CSS Variables)
- **Accessibility**: WCAG 2.2 AA (Rasio kontras teks operasional > 4.5:1)
