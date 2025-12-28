// ---------- Données simulées ----------
let patients = [
  { id: 1, nom: "Ali", age: 30, maladie: "Grippe" },
  { id: 2, nom: "Sara", age: 25, maladie: "Diabète" }
];
let medecins = [
  { id: 1, nom: "Dr. Ahmed", specialite: "Cardiologue" },
  { id: 2, nom: "Dr. Leila", specialite: "Dermatologue" }
];
let rendezvous = [
  { id: 1, patient: "Ali", medecin: "Dr. Ahmed", date: "2025-01-10" }
];
let prescriptions = [
  { id: 1, patient: "Sara", medicament: "Insuline", dosage: "2x/jour" }
];
let services = [
  { id: 1, nom: "Urgences", capacite: 50 },
  { id: 2, nom: "Radiologie", capacite: 20 }
];

// Chart instances
let chartPatientsInstance = null;
let chartRendezvousInstance = null;

// ---------- Login / Logout ----------
function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (user === "admin" && pass === "admin") {
    document.getElementById("loginPage").style.display = "none";
    document.querySelector(".topnav").style.display = "flex";
    document.querySelector("main").style.display = "block";
    document.getElementById("welcomeText").textContent = `Bienvenue, ${user}`;
    showSection("patients");
    renderDashboard();
  } else {
    alert("Identifiants incorrects !");
  }
}

function logout() {
  // simple logout: show login page and hide main UI
  document.getElementById("loginPage").style.display = "flex";
  document.querySelector(".topnav").style.display = "none";
  document.querySelector("main").style.display = "none";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  // destroy charts
  if (chartPatientsInstance) { chartPatientsInstance.destroy(); chartPatientsInstance = null; }
  if (chartRendezvousInstance) { chartRendezvousInstance.destroy(); chartRendezvousInstance = null; }
}

// ---------- Navigation ----------
function showSection(id) {
  document.querySelectorAll(".crud-section").forEach((sec) => sec.classList.remove("active"));
  const section = document.getElementById(id);
  if (!section) return;
  section.classList.add("active");
  renderCRUD(id);
}

// ---------- Render CRUD (generic) ----------
function renderCRUD(entityName) {
  const data = safeEval(entityName);
  const section = document.getElementById(entityName);
  if (!section) return;

  // Controls: add, export, search
  const controlsHtml = `
    <div class="controls">
      <button class="btn add" onclick="addItem('${entityName}')">➕ Ajouter</button>
      <button class="btn export" onclick="exportCSV('${entityName}')">📤 Export CSV</button>
      <button class="btn export" onclick="exportPDF('${entityName}')">📄 Export PDF</button>
      <input type="text" placeholder="Rechercher..." onkeyup="filterTable('${entityName}', this.value)" />
    </div>
  `;

  // Table
  let tableHtml = "";
  if (!data || data.length === 0) {
    tableHtml = `<div class="table-wrap"><table><tr><td style="padding:20px">Aucune donnée disponible.</td></tr></table></div>`;
  } else {
    const headers = Object.keys(data[0]);
    const headerRow = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("") + "<th>Actions</th>";
    const rows = data
      .map((item) => {
        const cells = Object.values(item)
          .map((v) => `<td>${escapeHtml(String(v))}</td>`)
          .join("");
        return `<tr>${cells}<td>
          <button class="btn edit" onclick="editItem('${entityName}', ${item.id})">✏️</button>
          <button class="btn delete" onclick="deleteItem('${entityName}', ${item.id})">🗑️</button>
        </td></tr>`;
      })
      .join("");
    tableHtml = `<div class="table-wrap"><table><thead><tr>${headerRow}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  section.innerHTML = `<h2>${capitalize(entityName)}</h2>${controlsHtml}${tableHtml}`;
}

// ---------- Safe eval for entity arrays ----------
function safeEval(name) {
  switch (name) {
    case "patients": return patients;
    case "medecins": return medecins;
    case "rendezvous": return rendezvous;
    case "prescriptions": return prescriptions;
    case "services": return services;
    default: return [];
  }
}

// ---------- Add item (generic prompt-based) ----------
function addItem(entityName) {
  const data = safeEval(entityName);
  const template = data[0] || { id: 1 };
  const newObj = {};
  const newId = data.length ? Math.max(...data.map(d => d.id)) + 1 : 1;

  for (const key of Object.keys(template)) {
    if (key === "id") continue;
    const val = prompt(`Entrer ${key}:`);
    if (val === null) return; // cancel
    newObj[key] = parseValue(val);
  }
  newObj.id = newId;
  data.push(newObj);
  renderCRUD(entityName);
  renderDashboard();
}

// ---------- Delete item ----------
function deleteItem(entityName, id) {
  const data = safeEval(entityName);
  const idx = data.findIndex(i => i.id === id);
  if (idx === -1) return;
  if (!confirm("Confirmer la suppression ?")) return;
  data.splice(idx, 1);
  renderCRUD(entityName);
  renderDashboard();
}

// ---------- Edit item ----------
function editItem(entityName, id) {
  const data = safeEval(entityName);
  const item = data.find(i => i.id === id);
  if (!item) return;
  for (const key of Object.keys(item)) {
    if (key === "id") continue;
    const val = prompt(`Modifier ${key}:`, item[key]);
    if (val === null) continue;
    item[key] = parseValue(val);
  }
  renderCRUD(entityName);
  renderDashboard();
}

// ---------- Filter / Search ----------
function filterTable(entityName, query) {
  const data = safeEval(entityName);
  if (!data) return;
  const q = query.trim().toLowerCase();
  const filtered = data.filter(item =>
    Object.values(item).some(v => String(v).toLowerCase().includes(q))
  );
  renderFiltered(entityName, filtered);
}

function renderFiltered(entityName, data) {
  const section = document.getElementById(entityName);
  if (!section) return;
  const controlsHtml = section.querySelector(".controls")?.outerHTML || "";
  let tableHtml = "";
  if (!data || data.length === 0) {
    tableHtml = `<div class="table-wrap"><table><tr><td style="padding:20px">Aucune donnée trouvée.</td></tr></table></div>`;
  } else {
    const headers = Object.keys(data[0]);
    const headerRow = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("") + "<th>Actions</th>";
    const rows = data
      .map((item) => {
        const cells = Object.values(item)
          .map((v) => `<td>${escapeHtml(String(v))}</td>`)
          .join("");
        return `<tr>${cells}<td>
          <button class="btn edit" onclick="editItem('${entityName}', ${item.id})">✏️</button>
          <button class="btn delete" onclick="deleteItem('${entityName}', ${item.id})">🗑️</button>
        </td></tr>`;
      })
      .join("");
    tableHtml = `<div class="table-wrap"><table><thead><tr>${headerRow}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  section.innerHTML = `<h2>${capitalize(entityName)}</h2>${controlsHtml}${tableHtml}`;
}

// ---------- Export CSV ----------
function exportCSV(entityName) {
  const data = safeEval(entityName);
  if (!data || data.length === 0) { alert("Aucune donnée à exporter."); return; }
  const keys = Object.keys(data[0]);
  const csv = [keys.join(",")]
    .concat(data.map(row => keys.map(k => csvEscape(String(row[k] ?? ""))).join(",")))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${entityName}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------- Export PDF (simple) ----------
function exportPDF(entityName) {
  const data = safeEval(entityName);
  if (!data || data.length === 0) { alert("Aucune donnée à exporter."); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text(`${capitalize(entityName)} - Rapport`, 10, 12);
  let y = 20;
  const keys = Object.keys(data[0]);
  // header
  doc.setFontSize(10);
  doc.text(keys.join(" | "), 10, y);
  y += 6;
  data.forEach(row => {
    const line = keys.map(k => String(row[k] ?? "")).join(" | ");
    doc.text(line, 10, y);
    y += 6;
    if (y > 280) { doc.addPage(); y = 20; }
  });
  doc.save(`${entityName}.pdf`);
}

// ---------- Dashboard (Chart.js) ----------
function renderDashboard() {
  // Patients pie by age groups (simple)
  const ctxP = document.getElementById("chartPatients").getContext("2d");
  const labelsP = patients.map(p => p.nom);
  const dataP = patients.map(p => Number(p.age) || 0);
  if (chartPatientsInstance) chartPatientsInstance.destroy();
  chartPatientsInstance = new Chart(ctxP, {
    type: "pie",
    data: {
      labels: labelsP,
      datasets: [{ data: dataP, backgroundColor: generateColors(dataP.length) }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // Rendezvous bar by date (count)
  const ctxR = document.getElementById("chartRendezvous").getContext("2d");
  const counts = {};
  rendezvous.forEach(r => { counts[r.date] = (counts[r.date] || 0) + 1; });
  const labelsR = Object.keys(counts);
  const dataR = labelsR.map(d => counts[d]);
  if (chartRendezvousInstance) chartRendezvousInstance.destroy();
  chartRendezvousInstance = new Chart(ctxR, {
    type: "bar",
    data: {
      labels: labelsR,
      datasets: [{ label: "Rendez-vous", data: dataR, backgroundColor: "#9b59b6" }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// ---------- Helpers ----------
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function csvEscape(s) { return `"${s.replace(/"/g, '""')}"`; }
function parseValue(v) {
  // try number
  if (!isNaN(v) && v.trim() !== "") return v.includes(".") ? parseFloat(v) : parseInt(v, 10);
  return v;
}
function generateColors(n) {
  const palette = ["#3498db","#e74c3c","#2ecc71","#f1c40f","#9b59b6","#1abc9c","#e67e22","#34495e"];
  const out = [];
  for (let i = 0; i < n; i++) out.push(palette[i % palette.length]);
  return out;
}
