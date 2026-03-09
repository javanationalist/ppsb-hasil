const seedParticipants = [
  {
    id: "1",
    nomorPeserta: "202601001",
    pin: "1234",
    nisn: "0053242485",
    nomorRegistrasi: "423095502",
    nama: "Budi Santoso",
    kelasDitempatkan: "X-3",
    nomorPresensi: 18,
    tanggalLahir: "12 Mei 2007",
    asalSekolah: "SMP Negeri 2 Surabaya",
    kabupatenKota: "Surabaya",
    provinsi: "Jawa Timur",
    status: "LULUS",
    randomCode: "A9X2P7"
  },
  {
    id: "2",
    nomorPeserta: "202601002",
    pin: "1234",
    nisn: "0053242486",
    nomorRegistrasi: "423095503",
    nama: "Siti Aminah",
    kelasDitempatkan: "X-1",
    nomorPresensi: 5,
    tanggalLahir: "10 April 2007",
    asalSekolah: "SMP Negeri 1 Jakarta",
    kabupatenKota: "Jakarta Selatan",
    provinsi: "DKI Jakarta",
    status: "LULUS",
    randomCode: "B8Y3Q8"
  },
  {
    id: "3",
    nomorPeserta: "202601003",
    pin: "1234",
    nisn: "0053242487",
    nomorRegistrasi: "423095504",
    nama: "Andi Wijaya",
    kelasDitempatkan: "-",
    nomorPresensi: 0,
    tanggalLahir: "15 Agustus 2007",
    asalSekolah: "SMP Negeri 3 Bandung",
    kabupatenKota: "Bandung",
    provinsi: "Jawa Barat",
    status: "TIDAK LULUS",
    randomCode: "C7Z4R9"
  },
  {
    id: "4",
    nomorPeserta: "202601004",
    pin: "1234",
    nisn: "0053242488",
    nomorRegistrasi: "423095505",
    nama: "Dewi Lestari",
    kelasDitempatkan: "-",
    nomorPresensi: 0,
    tanggalLahir: "20 Januari 2007",
    asalSekolah: "SMP Negeri 4 Yogyakarta",
    kabupatenKota: "Yogyakarta",
    provinsi: "DI Yogyakarta",
    status: "SEDANG DISELEKSI",
    randomCode: "D6A5S0"
  }
];

function initDB() {
  if (!localStorage.getItem('participants')) {
    localStorage.setItem('participants', JSON.stringify(seedParticipants));
  }
}

function generateRandomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function handleLogin(e) {
  e.preventDefault();
  
  const nomorPeserta = document.getElementById('nomorPeserta').value.trim();
  const pin = document.getElementById('pin').value.trim();
  const errorMsg = document.getElementById('errorMsg');
  
  if (!nomorPeserta || !pin) {
    errorMsg.textContent = "Nomor Peserta dan PIN wajib diisi.";
    errorMsg.style.display = "block";
    return;
  }
  
  document.getElementById('loader').style.display = 'flex';
  errorMsg.style.display = "none";
  
  setTimeout(() => {
    const participants = JSON.parse(localStorage.getItem('participants') || '[]');
    const user = participants.find(p => p.nomorPeserta === nomorPeserta && p.pin === pin);
    
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      window.location.href = 'result.html';
    } else {
      document.getElementById('loader').style.display = 'none';
      errorMsg.textContent = "Data tidak ditemukan. Periksa kembali nomor peserta dan PIN Anda.";
      errorMsg.style.display = "block";
    }
  }, 1500);
}

function loadResult() {
  const userStr = sessionStorage.getItem('currentUser');
  if (!userStr) {
    window.location.href = 'index.html';
    return;
  }
  
  const user = JSON.parse(userStr);
  
  document.getElementById('identitasTop').textContent = `NISN ${user.nisn || '-'} - NO REG ${user.nomorRegistrasi || user.nomorPeserta}`;
  document.getElementById('namaPeserta').textContent = user.nama;
  
  if (user.status === 'LULUS') {
    document.getElementById('penempatan').textContent = `DITEMPATKAN DI KELAS ${user.kelasDitempatkan} - NOMOR PRESENSI ${user.nomorPresensi}`;
    document.getElementById('headerTitle').textContent = "SELAMAT! ANDA DINYATAKAN LULUS";
    document.body.style.background = "#0f0f10";
    
    const qrPayload = `${user.nisn}-${user.nomorRegistrasi}-${user.randomCode}`;
    new QRCode(document.getElementById("qrcode"), {
      text: qrPayload,
      width: 180,
      height: 180,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
    
  } else if (user.status === 'TIDAK LULUS') {
    document.getElementById('headerTitle').textContent = "HASIL SELEKSI";
    document.getElementById('penempatan').textContent = "Mohon maaf, Anda belum dinyatakan lulus seleksi.";
    document.getElementById('penempatan').style.color = "#FF3B30";
    document.getElementById('qrCard').style.display = "none";
    document.getElementById('regBox').style.display = "none";
  } else {
    document.getElementById('headerTitle').textContent = "HASIL SELEKSI";
    document.getElementById('penempatan').textContent = "Hasil seleksi Anda masih dalam proses. Silakan cek kembali secara berkala.";
    document.getElementById('qrCard').style.display = "none";
    document.getElementById('regBox').style.display = "none";
  }
  
  document.getElementById('tglLahir').textContent = user.tanggalLahir || '-';
  document.getElementById('kabKota').textContent = user.kabupatenKota || '-';
  document.getElementById('asalSekolah').textContent = user.asalSekolah || '-';
  document.getElementById('provinsi').textContent = user.provinsi || '-';
  
  document.getElementById('qrCard').addEventListener('contextmenu', e => e.preventDefault());
}

function printResult() {
  window.print();
}

document.addEventListener('DOMContentLoaded', () => {
  initDB();
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (document.body.classList.contains('result-page')) {
    loadResult();
  }
});
