# PT Hasta Karya Sejahtera Indonesia Website

Website company profile produksi untuk PT Hasta Karya Sejahtera Indonesia (HKSI).

## Ringkasan

Project ini menggunakan HTML5, CSS3, dan Vanilla JavaScript tanpa framework eksternal. Website disiapkan untuk deployment statis di GitHub Pages, Cloudflare Pages, atau hosting statis lain dengan custom domain.

## Struktur

- `index.html` - halaman utama corporate profile.
- `project.html` - halaman portfolio dengan filter kategori dan lightbox.
- `404.html` - halaman fallback untuk route tidak ditemukan.
- `offline.html` - halaman fallback PWA saat offline.
- `manifest.json` - konfigurasi Web App Manifest.
- `service-worker.js` - cache PWA dan offline support.
- `robots.txt` - instruksi crawler.
- `sitemap.xml` - sitemap SEO.
- `assets/css/style.css` - stylesheet utama.
- `assets/js/main.js` - JavaScript interaksi.
- `assets/img` - aset visual website.

## Fitur

- Responsive layout mobile-first.
- Sticky header dan mobile menu accessible.
- SEO metadata, Open Graph, Twitter Card, canonical URL, dan JSON-LD.
- Content architecture berbasis JSON di folder `content/`.
- Services, projects, gallery, statistics, contact, SEO, dan navigation dirender dari content files.
- Portfolio filter.
- Gallery dan project lightbox.
- Contact form UI yang membuka WhatsApp dengan pesan terstruktur.
- Floating WhatsApp dan back-to-top.
- PWA manifest, service worker, dan offline page.
- 404 page.
- Reduced motion support dan visible focus state.

## CMS Ready

Project sudah disiapkan untuk Decap CMS berbasis JSON, tetapi Decap CMS belum dipasang. Proposal konfigurasi tersedia di `content/decap-config.proposal.yml`, dan rencana migrasi tersedia di `CMS_MIGRATION_PLAN.md`.

Karena konten dimuat dari file JSON melalui `fetch`, gunakan local server saat preview. Membuka `index.html` langsung via file browser tidak direkomendasikan.

## Deployment Cloudflare Pages

1. Hubungkan repository ke Cloudflare Pages.
2. Build command dikosongkan.
3. Output directory gunakan root project.
4. Pasang custom domain `www.hksi.co.id`.
5. Pastikan HTTPS aktif.

## Kontak

PT Hasta Karya Sejahtera Indonesia  
Kota Cilegon, Banten  
0895 0243 1727  
pt.hastakaryasejahteraind@gmail.com
