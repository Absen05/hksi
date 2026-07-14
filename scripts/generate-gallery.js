#!/usr/bin/env node
/**
 * generate-gallery.js
 * ---------------------------------------------------------------------
 * Scan folder assets/img/gallery/supply, /laboratory, /survey, lalu
 * otomatis update content/gallery.json (array photos_supply,
 * photos_laboratory, photos_survey) sesuai foto yang ada di sana.
 *
 * CARA PAKAI:
 *   1. Copy foto ke assets/img/gallery/<kategori>/ dengan nama bebas
 *      (disarankan: supply-1.jpg, supply-2.png, dst — urut angka
 *      menentukan urutan tampil di website).
 *   2. Jalankan dari root folder project:
 *        node scripts/generate-gallery.js
 *   3. Script akan cetak ringkasan foto yang ditambah/dihapus/tetap.
 *   4. Lanjut seperti biasa: git add -A, git commit, git push.
 *
 * ATURAN PENTING:
 *   - Foto yang SUDAH ADA di gallery.json (path-nya sama persis) TIDAK
 *     akan ditimpa alt/caption-nya — jadi aman kalau Bang Pay sudah
 *     pernah edit caption manual sebelumnya, tidak akan hilang.
 *   - Foto BARU (belum ada di gallery.json) akan dapat alt/caption
 *     default hasil generate dari nama file. Silakan edit manual di
 *     content/gallery.json setelah generate kalau mau caption yang
 *     lebih deskriptif/sesuai konteks foto aslinya.
 *   - Foto yang dihapus dari folder otomatis ikut hilang dari JSON.
 *   - Urutan tampil = urutan angka di nama file (supply-2 sebelum
 *     supply-10), lalu fallback alfabet kalau tidak ada angka.
 *   - Ekstensi yang didukung: .jpg, .jpeg, .png, .webp (case-insensitive)
 * ---------------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GALLERY_JSON_PATH = path.join(ROOT, "content", "gallery.json");
const GALLERY_IMG_DIR = path.join(ROOT, "assets", "img", "gallery");

const CATEGORIES = [
  { key: "supply", jsonField: "photos_supply", label: "Supply Material" },
  { key: "laboratory", jsonField: "photos_laboratory", label: "Laboratorium" },
  { key: "survey", jsonField: "photos_survey", label: "Survey & Pengukuran" }
];

const VALID_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function naturalSortKey(filename) {
  const match = filename.match(/(\d+)/);
  const num = match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
  return [num, filename.toLowerCase()];
}

function compareNatural(a, b) {
  const [numA, strA] = naturalSortKey(a);
  const [numB, strB] = naturalSortKey(b);
  if (numA !== numB) return numA - numB;
  return strA.localeCompare(strB);
}

function defaultAltCaption(filename, categoryLabel) {
  const base = path.basename(filename, path.extname(filename));
  const match = base.match(/(\d+)/);
  const num = match ? ` ${match[1]}` : "";
  const alt = `Dokumentasi ${categoryLabel}${num} HKSI`;
  const caption = `Dokumentasi ${categoryLabel}${num}`;
  return { alt, caption };
}

function main() {
  if (!fs.existsSync(GALLERY_JSON_PATH)) {
    console.error(`ERROR: File tidak ditemukan: ${GALLERY_JSON_PATH}`);
    console.error("Pastikan script ini dijalankan dari root folder project.");
    process.exit(1);
  }

  const gallery = JSON.parse(fs.readFileSync(GALLERY_JSON_PATH, "utf8"));
  const summary = [];

  for (const { key, jsonField, label } of CATEGORIES) {
    const dir = path.join(GALLERY_IMG_DIR, key);

    if (!fs.existsSync(dir)) {
      console.warn(`WARNING: Folder tidak ditemukan, dilewati: ${dir}`);
      continue;
    }

    const files = fs
      .readdirSync(dir)
      .filter((f) => VALID_EXT.has(path.extname(f).toLowerCase()))
      .sort(compareNatural);

    const existingByPath = new Map(
      (gallery[jsonField] || []).map((photo) => [photo.image, photo])
    );

    const newList = files.map((filename) => {
      const relPath = `assets/img/gallery/${key}/${filename}`.replace(/\\/g, "/");
      if (existingByPath.has(relPath)) {
        // Foto sudah ada di JSON sebelumnya — pertahankan alt/caption manual.
        return existingByPath.get(relPath);
      }
      // Foto baru — generate alt/caption default.
      const { alt, caption } = defaultAltCaption(filename, label);
      return { image: relPath, alt, caption };
    });

    const oldCount = (gallery[jsonField] || []).length;
    const addedCount = newList.filter((p) => !existingByPath.has(p.image)).length;
    const removedCount = (gallery[jsonField] || []).filter(
      (p) => !files.some((f) => `assets/img/gallery/${key}/${f}` === p.image)
    ).length;

    gallery[jsonField] = newList;
    summary.push({
      label,
      total: newList.length,
      added: addedCount,
      removed: removedCount,
      oldCount
    });
  }

  fs.writeFileSync(GALLERY_JSON_PATH, JSON.stringify(gallery, null, 2) + "\n", "utf8");

  console.log("\n=== content/gallery.json berhasil diupdate ===\n");
  for (const s of summary) {
    console.log(
      `${s.label}: ${s.total} foto total ` +
        `(+${s.added} baru, -${s.removed} dihapus, sebelumnya ${s.oldCount})`
    );
  }
  console.log(
    "\nCek dulu isi content/gallery.json (terutama alt/caption foto baru)," +
      " lalu lanjutkan: git add -A && git commit -m \"...\" && git push origin main\n"
  );
}

main();
