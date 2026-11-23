// =========================================================
// DATA INFORMASI KE-5 TUGU (Urutan sesuai targets.mind Anda)
// =========================================================
const dataTugu = [
  {
    tag: "TUGU 01",
    tahun: "Est. 1947",
    judul: "Tugu Koperasi",
    lokasi: "Kota Tasikmalaya, Jawa Barat",
    deskripsi: "Tugu Koperasi di Tasikmalaya merupakan monumen bersejarah saksi Kongres Koperasi Pertama (12 Juli 1947) bersama Bung Hatta, yang melahirkan asas gotong royong serta cikal bakal Hari Koperasi Nasional."
  },
  {
    tag: "TUGU 02",
    tahun: "Era 1960-an",
    judul: "Tugu Simpang Lima",
    lokasi: "Kota Tasikmalaya, Jawa Barat",
    deskripsi: "Tugu Simpang Lima Tasikmalaya dibangun pada tahun 1960-an sebagai simbol persatuan dan semangat perjuangan rakyat Tasikmalaya untuk meraih serta mempertahankan kemerdekaan."
  },
  {
    tag: "TUGU 03",
    tahun: "Era 2010-an",
    judul: "Tugu Asmaul Husna",
    lokasi: "Kota Tasikmalaya, Jawa Barat",
    deskripsi: "Tugu Asmaul Husna Tasikmalaya dibangun pada era 2010-an sebagai simbol identitas religius Kota Santri serta pengingat spiritual bagi masyarakat untuk meneladani 99 nama baik Allah SWT dalam kehidupan sehari-hari."
  },
  {
    tag: "TUGU 04",
    tahun: "Ikon Budaya",
    judul: "Tugu Kelom Geulis",
    lokasi: "Gobras, Kec. Tamansari, Kota Tasikmalaya",
    deskripsi: "Tugu Kelom Geulis dibangun sebagai penanda wilayah sekaligus bentuk penghormatan terhadap sejarah lahirnya sentra kerajinan kelom geulis di daerah Gobras, Kecamatan Tamansari, Kota Tasikmalaya."
  },
  {
    tag: "TUGU 05",
    tahun: "Est. 2016",
    judul: "Tugu Lam-Alif",
    lokasi: "Kabupaten Tasikmalaya, Jawa Barat",
    deskripsi: "Monumen Lam Alif dibangun pada tahun 2016. Pembangunan monumen ini berawal dari keinginan Bupati Uu Ruzhanul Ulum untuk menciptakan sebuah ikon yang dapat menggambarkan karakter dan jati diri masyarakat Kabupaten Tasikmalaya."
  }
];

const infoDrawer = document.getElementById("infoDrawer");
const scannerFrame = document.getElementById("scannerFrame");
const statusBadge = document.getElementById("statusBadge");
const statusDot = document.getElementById("statusDot");
const btnClose = document.getElementById("btnClose");
const btnReopen = document.getElementById("btnReopen");
const btnReset = document.getElementById("btnReset");

const tuguTag = document.getElementById("tuguTag");
const tuguYear = document.getElementById("tuguYear");
const tuguTitle = document.getElementById("tuguTitle");
const tuguLocation = document.getElementById("tuguLocation");
const tuguDesc = document.getElementById("tuguDesc");

const btnVoice = document.getElementById("btnVoice");
const voiceIcon = document.getElementById("voiceIcon");
const voiceLabel = document.getElementById("voiceLabel");

// =========================================================
// FITUR NARASI SUARA (WEB SPEECH API BAHASA INDONESIA)
// =========================================================
let currentNarrationText = "";
let isSpeaking = false;

function stopVoice() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  btnVoice.classList.remove("speaking");
  voiceIcon.textContent = "🔊";
  voiceLabel.textContent = "Dengarkan Narasi";
}

function playVoice(text) {
  if (!("speechSynthesis" in window)) return;

  stopVoice();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "id-ID";
  utterance.rate = 0.96;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const indoVoice = voices.find((v) => v.lang.includes("id"));
  if (indoVoice) {
    utterance.voice = indoVoice;
  }

  utterance.onstart = () => {
    isSpeaking = true;
    btnVoice.classList.add("speaking");
    voiceIcon.textContent = "⏹️";
    voiceLabel.textContent = "Hentikan Suara";
  };

  utterance.onend = () => stopVoice();
  utterance.onerror = () => stopVoice();

  window.speechSynthesis.speak(utterance);
}

btnVoice.addEventListener("click", () => {
  if (isSpeaking) {
    stopVoice();
  } else if (currentNarrationText) {
    playVoice(currentNarrationText);
  }
});

// Tutup & buka kembali panel informasi
btnClose.addEventListener("click", () => {
  infoDrawer.classList.remove("active");
  stopVoice();
  if (activeWrapper) {
    btnReopen.classList.remove("hidden");
  }
});

btnReopen.addEventListener("click", () => {
  infoDrawer.classList.add("active");
  btnReopen.classList.add("hidden");
});

// Reset rotasi & skala model 3D ke awal
btnReset.addEventListener("click", () => {
  if (!activeWrapper) return;
  activeWrapper.object3D.rotation.set(0, 0, 0);
  activeWrapper.object3D.scale.set(0.4, 0.4, 0.4);
  autoRotate = true;
});

// =========================================================
// DETEKSI MARKER, ROTASI OTOMATIS & GESTUR SENTUHAN
// =========================================================
let activeWrapper = null;
let autoRotate = true;
let isDragging = false;
let prevX = 0;
let prevY = 0;
let initialPinchDistance = null;
let initialScale = 0.4;

// Animasi rotasi otomatis (berhenti saat disentuh pengguna)
function animateAutoRotation() {
  if (activeWrapper && autoRotate && !isDragging) {
    activeWrapper.object3D.rotation.z += 0.008;
  }
  requestAnimationFrame(animateAutoRotation);
}
animateAutoRotation();

dataTugu.forEach((tugu, index) => {
  const targetEntity = document.getElementById(`target-${index}`);
  const wrapperEntity = document.getElementById(`wrapper-${index}`);

  if (!targetEntity || !wrapperEntity) return;

  targetEntity.addEventListener("targetFound", () => {
    tuguTag.textContent = tugu.tag;
    tuguYear.textContent = tugu.tahun;
    tuguTitle.textContent = tugu.judul;
    tuguLocation.textContent = tugu.lokasi;
    tuguDesc.textContent = tugu.deskripsi;

    currentNarrationText = `${tugu.judul}. ${tugu.deskripsi}`;

    infoDrawer.classList.add("active");
    btnReopen.classList.add("hidden");
    scannerFrame.classList.add("fade-out");
    statusDot.classList.add("detected");
    statusBadge.textContent = tugu.judul;

    activeWrapper = wrapperEntity;
    initialScale = activeWrapper.object3D.scale.x;
    autoRotate = true;

    playVoice(currentNarrationText);
  });

  targetEntity.addEventListener("targetLost", () => {
    infoDrawer.classList.remove("active");
    btnReopen.classList.add("hidden");
    scannerFrame.classList.remove("fade-out");
    statusDot.classList.remove("detected");
    statusBadge.textContent = "Arahkan kamera ke Poster Marker Tugu";

    stopVoice();

    if (activeWrapper === wrapperEntity) {
      activeWrapper = null;
    }
  });
});

function getPinchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

window.addEventListener("touchstart", (e) => {
  if (e.target.closest("#infoDrawer") || e.target.closest("#btnReopen") || !activeWrapper) return;

  // Hentikan rotasi otomatis begitu pengguna menggeser/menyentuh model
  autoRotate = false;

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

window.addEventListener("touchmove", (e) => {
  if (!activeWrapper) return;

  if (e.touches.length === 1 && isDragging) {
    const deltaX = e.touches[0].clientX - prevX;
    const deltaY = e.touches[0].clientY - prevY;

    activeWrapper.object3D.rotation.z += deltaX * 0.01;
    activeWrapper.object3D.rotation.x += deltaY * 0.01;

    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  }

  if (e.touches.length === 2 && initialPinchDistance) {
    const currentDistance = getPinchDistance(e.touches);
    const scaleFactor = currentDistance / initialPinchDistance;

    let newScale = Math.min(Math.max(initialScale * scaleFactor, 0.1), 2.5);
    activeWrapper.object3D.scale.set(newScale, newScale, newScale);
  }
}, { passive: true });

window.addEventListener("touchend", () => {
  isDragging = false;
  initialPinchDistance = null;
});