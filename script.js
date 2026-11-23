// =========================================================
// DATA INFORMASI KE-5 TUGU (Sesuaikan urutan dengan targets.mind)
// =========================================================
const dataTugu = [
  {
    tag: "TUGU 01",
    judul: "Tugu Koperasi",
    lokasi: "Kota Tasikmalaya, Jawa Barat",
    deskripsi: "Tugu Koperasi di Tasikmalaya merupakan monumen bersejarah saksi Kongres Koperasi Pertama (12 Juli 1947) bersama Bung Hatta, yang melahirkan asas gotong royong serta cikal bakal Hari Koperasi Nasional."
  },
  {
    tag: "TUGU 02",
    judul: "Tugu Simpang Lima",
    lokasi: "Kota Tasikmalaya, Jawa Barat",
    deskripsi: "Tugu Simpang Lima Tasikmalaya dibangun pada tahun 1960-an sebagai simbol persatuan dan semangat perjuangan rakyat Tasikmalaya untuk meraih serta mempertahankan kemerdekaan."
  },
  {
    tag: "TUGU 03",
    judul: "Tugu Asmaul Husna",
    lokasi: "Kota Tasikmalaya, Jawa Barat",
    deskripsi: "Tugu Asmaul Husna Tasikmalaya dibangun pada era 2010-an sebagai simbol identitas religius Kota Santri serta pengingat spiritual bagi masyarakat untuk meneladani 99 nama baik Allah SWT dalam kehidupan sehari-hari."
  },
  {
    tag: "TUGU 04",
    judul: "Tugu Kelom Geulis",
    lokasi: "Kota Tasikmalaya, Jawa Barat",
    deskripsi: "Tugu Kelom Geulis dibangun sebagai penanda wilayah sekaligus bentuk penghormatan terhadap sejarah lahirnya sentra kerajinan kelom geulis di daerah Gobras, Kecamatan Tamansari, Kota Tasikmalaya."
  },
  {
    tag: "TUGU 05",
    judul: "Tugu Lam-Alif",
    lokasi: "Kabupaten Tasikmalaya, Jawa Barat",
    deskripsi: "Monumen Lam Alif dibangun pada tahun 2016 pembangunan monumen ini berawal dari keinginan Bupati Uu Ruzhanul Ulum untuk menciptakan sebuah ikon yang dapat menggambarkan karakter dan jati diri masyarakat Kabupaten Tasikmalaya."
  }
];

const infoDrawer = document.getElementById("infoDrawer");
const scannerFrame = document.getElementById("scannerFrame");
const statusBadge = document.getElementById("statusBadge");
const btnClose = document.getElementById("btnClose");

const tuguTag = document.getElementById("tuguTag");
const tuguTitle = document.getElementById("tuguTitle");
const tuguLocation = document.getElementById("tuguLocation");
const tuguDesc = document.getElementById("tuguDesc");

// Tombol tutup panel secara manual
btnClose.addEventListener("click", () => {
  infoDrawer.classList.remove("active");
});

// =========================================================
// DETEKSI MARKER & KONTROL GESTUR (1 Jari Putar, 2 Jari Zoom)
// =========================================================
let activeWrapper = null;
let isDragging = false;
let prevX = 0;
let prevY = 0;
let initialPinchDistance = null;
let initialScale = 0.4;

dataTugu.forEach((tugu, index) => {
  const targetEntity = document.getElementById(`target-${index}`);
  const wrapperEntity = document.getElementById(`wrapper-${index}`);

  if (!targetEntity || !wrapperEntity) return;

  // Saat marker tugu terdeteksi kamera
  targetEntity.addEventListener("targetFound", () => {
    tuguTag.textContent = tugu.tag;
    tuguTitle.textContent = tugu.judul;
    tuguLocation.textContent = tugu.lokasi;
    tuguDesc.textContent = tugu.deskripsi;

    infoDrawer.classList.add("active");
    scannerFrame.classList.add("hidden");
    statusBadge.textContent = `Terdeteksi: ${tugu.judul}`;

    activeWrapper = wrapperEntity;
    initialScale = activeWrapper.object3D.scale.x;
  });

  // Saat marker hilang dari kamera
  targetEntity.addEventListener("targetLost", () => {
    infoDrawer.classList.remove("active");
    scannerFrame.classList.remove("hidden");
    statusBadge.textContent = "Arahkan kamera ke Marker Tugu";

    if (activeWrapper === wrapperEntity) {
      activeWrapper = null;
    }
  });
});

// Helper hitung jarak 2 jari
function getPinchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

// Saat layar mulai disentuh
window.addEventListener("touchstart", (e) => {
  if (e.target.closest("#infoDrawer") || !activeWrapper) return;

  if (e.touches.length === 1) {
    isDragging = true;
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    isDragging = false;
    initialPinchDistance = getPinchDistance(e.touches);
    initialScale = activeWrapper.object3D.scale.x;
  }
}, { passive: true });

// Saat jari digeser di layar
window.addEventListener("touchmove", (e) => {
  if (!activeWrapper) return;

  // 1 Jari: Putar objek 3D
  if (e.touches.length === 1 && isDragging) {
    const deltaX = e.touches[0].clientX - prevX;
    const deltaY = e.touches[0].clientY - prevY;

    activeWrapper.object3D.rotation.z += deltaX * 0.01;
    activeWrapper.object3D.rotation.x += deltaY * 0.01;

    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  }

  // 2 Jari: Zoom (perbesar / perkecil)
  if (e.touches.length === 2 && initialPinchDistance) {
    const currentDistance = getPinchDistance(e.touches);
    const scaleFactor = currentDistance / initialPinchDistance;

    let newScale = Math.min(Math.max(initialScale * scaleFactor, 0.1), 2.5);
    activeWrapper.object3D.scale.set(newScale, newScale, newScale);
  }
}, { passive: true });

// Saat jari diangkat dari layar
window.addEventListener("touchend", () => {
  isDragging = false;
  initialPinchDistance = null;
});