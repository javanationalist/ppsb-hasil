document.addEventListener('DOMContentLoaded', () => {
  const adminLoginSection = document.getElementById('adminLoginSection');
  const adminDashboardSection = document.getElementById('adminDashboardSection');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const searchInput = document.getElementById('searchInput');
  const participantForm = document.getElementById('participantForm');
  
  if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    adminLoginSection.style.display = 'none';
    adminDashboardSection.style.display = 'block';
    renderDashboard();
  }
  
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('adminUsername').value;
      const pass = document.getElementById('adminPassword').value;
      
      if (user === 'admin' && pass === 'admin123') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        adminLoginSection.style.display = 'none';
        adminDashboardSection.style.display = 'block';
        renderDashboard();
      } else {
        document.getElementById('adminErrorMsg').style.display = 'block';
      }
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderTable(e.target.value);
    });
  }
  
  if (participantForm) {
    participantForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveParticipant();
    });
  }
});

function logoutAdmin() {
  sessionStorage.removeItem('adminLoggedIn');
  window.location.reload();
}

function getParticipants() {
  return JSON.parse(localStorage.getItem('participants') || '[]');
}

function renderDashboard() {
  const participants = getParticipants();
  
  document.getElementById('statTotal').textContent = participants.length;
  document.getElementById('statLulus').textContent = participants.filter(p => p.status === 'LULUS').length;
  document.getElementById('statTidakLulus').textContent = participants.filter(p => p.status === 'TIDAK LULUS').length;
  document.getElementById('statSedang').textContent = participants.filter(p => p.status === 'SEDANG DISELEKSI').length;
  
  renderTable();
}

function renderTable(searchQuery = '') {
  const participants = getParticipants();
  const tbody = document.getElementById('participantTableBody');
  tbody.innerHTML = '';
  
  const filtered = participants.filter(p => {
    const query = searchQuery.toLowerCase();
    return (p.nama && p.nama.toLowerCase().includes(query)) || 
           (p.nomorPeserta && p.nomorPeserta.toLowerCase().includes(query)) ||
           (p.nisn && p.nisn.toLowerCase().includes(query));
  });
  
  filtered.forEach(p => {
    const tr = document.createElement('tr');
    
    let statusClass = 'status-sedang';
    if (p.status === 'LULUS') statusClass = 'status-lulus';
    if (p.status === 'TIDAK LULUS') statusClass = 'status-tidak-lulus';
    
    tr.innerHTML = `
      <td>${p.nomorPeserta}</td>
      <td>${p.nisn || '-'}</td>
      <td style="font-weight: 500;">${p.nama}</td>
      <td><span class="status-badge ${statusClass}">${p.status}</span></td>
      <td class="action-links">
        <button onclick="editParticipant('${p.id}')">Edit</button>
        <button class="delete" onclick="deleteParticipant('${p.id}')">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openModal() {
  document.getElementById('participantForm').reset();
  document.getElementById('formId').value = '';
  document.getElementById('modalTitle').textContent = 'Tambah Peserta';
  document.getElementById('participantModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('participantModal').style.display = 'none';
}

function saveParticipant() {
  const id = document.getElementById('formId').value;
  const participants = getParticipants();
  
  const data = {
    nomorPeserta: document.getElementById('formNomorPeserta').value,
    pin: document.getElementById('formPin').value,
    nisn: document.getElementById('formNisn').value,
    nomorRegistrasi: document.getElementById('formNomorRegistrasi').value,
    nama: document.getElementById('formNama').value,
    kelasDitempatkan: document.getElementById('formKelas').value,
    nomorPresensi: document.getElementById('formPresensi').value,
    tanggalLahir: document.getElementById('formTglLahir').value,
    asalSekolah: document.getElementById('formAsalSekolah').value,
    kabupatenKota: document.getElementById('formKabKota').value,
    provinsi: document.getElementById('formProvinsi').value,
    status: document.getElementById('formStatus').value,
  };
  
  if (id) {
    const index = participants.findIndex(p => p.id === id);
    if (index !== -1) {
      data.id = id;
      data.randomCode = participants[index].randomCode;
      participants[index] = data;
    }
  } else {
    if (participants.some(p => p.nomorPeserta === data.nomorPeserta)) {
      alert('Nomor Peserta sudah terdaftar!');
      return;
    }
    data.id = generateId();
    data.randomCode = generateRandomCode();
    participants.push(data);
  }
  
  localStorage.setItem('participants', JSON.stringify(participants));
  closeModal();
  renderDashboard();
}

function editParticipant(id) {
  const participants = getParticipants();
  const p = participants.find(x => x.id === id);
  if (!p) return;
  
  document.getElementById('formId').value = p.id;
  document.getElementById('formNomorPeserta').value = p.nomorPeserta || '';
  document.getElementById('formPin').value = p.pin || '';
  document.getElementById('formNisn').value = p.nisn || '';
  document.getElementById('formNomorRegistrasi').value = p.nomorRegistrasi || '';
  document.getElementById('formNama').value = p.nama || '';
  document.getElementById('formKelas').value = p.kelasDitempatkan || '';
  document.getElementById('formPresensi').value = p.nomorPresensi || '';
  document.getElementById('formTglLahir').value = p.tanggalLahir || '';
  document.getElementById('formAsalSekolah').value = p.asalSekolah || '';
  document.getElementById('formKabKota').value = p.kabupatenKota || '';
  document.getElementById('formProvinsi').value = p.provinsi || '';
  document.getElementById('formStatus').value = p.status || 'SEDANG DISELEKSI';
  
  document.getElementById('modalTitle').textContent = 'Edit Peserta';
  document.getElementById('participantModal').style.display = 'flex';
}

function deleteParticipant(id) {
  if (confirm('Apakah Anda yakin ingin menghapus data peserta ini?')) {
    let participants = getParticipants();
    participants = participants.filter(p => p.id !== id);
    localStorage.setItem('participants', JSON.stringify(participants));
    renderDashboard();
  }
}

function resetData() {
  if (confirm('PERINGATAN: Semua data akan dihapus dan dikembalikan ke data awal (seed). Lanjutkan?')) {
    localStorage.removeItem('participants');
    initDB();
    renderDashboard();
  }
}

function exportCSV() {
  const participants = getParticipants();
  if (participants.length === 0) {
    alert('Tidak ada data untuk diexport.');
    return;
  }
  
  const headers = ['ID', 'Nomor Peserta', 'PIN', 'NISN', 'Nomor Registrasi', 'Nama', 'Kelas', 'No Presensi', 'Tanggal Lahir', 'Asal Sekolah', 'Kab/Kota', 'Provinsi', 'Status', 'Random Code'];
  
  const csvRows = [];
  csvRows.push(headers.join(','));
  
  participants.forEach(p => {
    const values = [
      p.id,
      p.nomorPeserta,
      p.pin,
      p.nisn,
      p.nomorRegistrasi,
      `"${p.nama}"`,
      `"${p.kelasDitempatkan}"`,
      p.nomorPresensi,
      `"${p.tanggalLahir}"`,
      `"${p.asalSekolah}"`,
      `"${p.kabupatenKota}"`,
      `"${p.provinsi}"`,
      p.status,
      p.randomCode
    ];
    csvRows.push(values.join(','));
  });
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'data_peserta.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
