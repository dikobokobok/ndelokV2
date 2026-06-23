
### File: `design.md`

```markdown
---
name: ndelok
description: sistem monitoring server
---

# Design System: ndelok

## 1. Overview

**Creative North Star: "The Bold Operator"**

Sebuah antarmuka Neobrutalist ber-kontras tinggi yang dirancang khusus untuk *power users* dan operator server. Sistem ini menolak mentah-mentah "kelembutan" dashboard SaaS modern (tanpa gradien, tanpa *soft shadow*, tanpa sudut melengkung halus). `ndelok` menggunakan *border* hitam tebal, warna status yang sangat jenuh (*vibrant flat fills*), dan *hard offset shadows* tanpa blur untuk menciptakan tata letak yang terasa fisik, mekanis, jujur, dan instan.

**Karakteristik Utama:**
- **Thick Outlines**: Setiap komponen, kartu, input, dan elemen interaktif wajib menggunakan border solid hitam `3px` (`#000000`).
- **Zero-Blur Hard Shadows**: Kedalaman bersifat anti-naturalistik. Bayangan adalah *offset* warna solid ber-token (contoh: `5px 5px 0px #000000`).
- **Categorical Color Theory**: Warna datar bertenaga pop-art memisahkan permukaan menjadi objek diskret yang jelas untuk mempercepat pemindaian data.
- **Assertive Typography**: Pemisahan tegas antara font *display/heading* yang berkarakter kuat dengan font *body* yang tenang untuk menjaga keterbacaan data log server yang padat.

---

## 2. Token Desain (CSS Custom Properties)

Aestetik Neobrutalism di-parameterisasi ke dalam token global agar mudah diimplementasikan secara sistemik pada kode CSS atau Tailwind aplikasi.

```css
:root {
  /* Struktur & Border */
  --border-thick: 3px solid #000000;
  --border-thin: 2px solid #000000;
  --radius-flat: 0px; /* Kotak tajam sempurna tanpa kelembutan */

  /* Sistem Tiga Tingkat Hard Shadow (Zero Blur) */
  --shadow-sm: 3px 3px 0px 0px #000000;   /* Badges, chips, inline actions */
  --shadow-md: 5px 5px 0px 0px #000000;   /* Cards, buttons, standard panels */
  --shadow-lg: 8px 8px 0px 0px #000000;   /* Overlays, AI Agent bubble, hero elements */

  /* Palette Warna Kanonikal (Flat Fills - WCAG AA Compliant) */
  --bg-main: #FFFDF5;         /* Off-white hangat untuk mengurangi lelah mata */
  --ink-black: #000000;       /* Semua teks utama, border, dan shadow */
  --neutral-muted: #E2E8F0;   /* Abu-abu struktural untuk header tabel/secondary */
  
  /* Status & Aksentasi Akselerasi (Saturasi Tinggi) */
  --sys-green: #88D498;       /* Status sehat / Go / Speed Metric */
  --sys-ram: #B8A9FA;         /* RAM / File Management (Lavender-Violet) */
  --sys-cpu: #FFD23F;         /* CPU / Warning State (Bold Yellow) */
  --sys-storage: #FF6B6B;     /* Storage / Critical Error (Coral Pink) */
  --sys-ai: #74B9FF;          /* AI DevOps Agent Overlay (Sky Blue) */
}

```

---

## 3. Typography

Neobrutalism sejati menggunakan kontras ekstrem: font *display* yang lantang dan berkarakter dipadukan dengan font *body/mono* yang sengaja dibuat tenang agar data metrik yang padat tidak melelahkan mata saat proses *debugging*.

### Font Stack

* **Display & Heading**: `Space Grotesk`, sans-serif (Geometris, memiliki *quirk*/*character*).
* **Body & Operational Copy**: `Inter`, sans-serif (Standar industri layar, sangat legibel).
* **Terminal & Logs**: `JetBrains Mono`, monospace (Mekanikal, presisi tinggi untuk data log).

### Hierarki Teks

* **Metric Large (Display)**: `Space Grotesk`, Bold, `4rem`, Line-height `1.0`, Tight Tracking. (Untuk angka beban server utama).
* **Page Title**: `Space Grotesk`, Bold, `2.5rem`, Line-height `1.1`.
* **Section Heading**: `Space Grotesk`, Medium/Bold, `1.5rem`.
* **Body UI**: `Inter`, Regular, `1rem`, Line-height `1.5`. (Untuk deskripsi, form label, dan teks operasional).
* **Terminal & Logs**: `JetBrains Mono`, Regular, `0.9rem`, Line-height `1.4`.

---

## 4. Perilaku Komponen & Interaksi (Mikro-Interaksi)

Elevasi Neobrutalism bersifat fisik. Elemen tidak "berpendar" saat didekati; mereka terangkat (*lift*) atau tertekan (*press down*) secara mekanis ke arah permukaan shadow.

### Perilaku Tombol & Kartu Kanonikal

* **State Default**: Menggunakan `--border-thick` dan `--shadow-md`.
* **State Hover**: Elemen bergeser sedikit ke atas-kiri secara instan, dan bayangan membesar:
```css
transform: translate(-2px, -2px);
box-shadow: 7px 7px 0px 0px #000000;

```


* **State Active (Diklik)**: Elemen terasa "tertekan" ke permukaan. Bergeser searah bayangan, dan bayangan hilang:
```css
transform: translate(3px, 3px);
box-shadow: none;

```


* **State Focus-Visible**: Wajib menggunakan `outline` dengan *offset* tegas agar penanda fokus keyboard tidak tertutup dekorasi *shadow*:
```css
outline: 3px solid var(--sys-ai);
outline-offset: 3px;

```



---

## 5. Components (Conceptual)

* **Metric Block**: Kotak ber-border tebal (`--border-thick`) dengan latar belakang warna datar jenuh (`--sys-green`, `--sys-cpu`, dll) menampilkan angka makro di tengahnya menggunakan font `Space Grotesk`.
* **Log Table**: Baris tabel yang dipisahkan oleh garis horizontal tebal (`--border-thin`) dengan warna latar bergantian abu-abu (`--neutral-muted`) tanpa radius sudut.
* **AI DevOps Bubble**: Komponen melayang (*floating*) persisten di sudut layar menggunakan `--shadow-lg`, berlatar belakang warna aksen khusus (`--sys-ai`) dengan ikon yang kontras.

---

## 6. Do's and Don'ts

### Do:

* **Do** pisahkan ekspresi visual: gunakan Neobrutalism agresif pada blok metrik hero, tetapi tenangkan tipografi pada teks log/paragraf.
* **Do** pastikan rasio kontras teks di atas permukaan warna datar minimal `4.5:1` (Sesuai standar WCAG 2.2 AA).
* **Do** gunakan fungsi *border* sebagai semantik pembatas objek yang jelas, bukan sekadar dekorasi acak.

### Don't:

* **Don't** gunakan efek transparansi, blur, atau gradien warna (*anti-glassmorphism*).
* **Don't** gunakan `border-radius` lebih dari `0px` atau `2px` (wajib mempertahankan ketajaman brutal).
* **Don't** mengandalkan warna semata untuk menunjukkan status error (selalu sertakan teks/ikon indikator penjelas untuk aksesibilitas *color-blind*).

```

```