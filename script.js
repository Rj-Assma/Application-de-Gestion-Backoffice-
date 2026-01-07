/* ===== Projet complet simplifié mais conforme à l'énoncé ===== */

/* ===== Utilisateurs (admin + assma) ===== */
const users = [
  { username: "admin", password: "admin" },
  { username: "assma", password: "1234" }
];

/* ===== DOM elements ===== */
const loginForm = document.getElementById("login-form");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const loginPage = document.getElementById("login-page");
const app = document.getElementById("app");
const loginError = document.getElementById("login-error");
const formPopup = document.getElementById("form-popup");
const formFields = document.getElementById("form-fields");
const formTitle = document.getElementById("form-title");
const entityForm = document.getElementById("entity-form");
const searchInput = document.getElementById("search-input");

/* ===== Entités et champs ===== */
const keys = ["livres", "auteurs", "adherents", "emprunts", "categories"];
const fields = {
  livres: ["titre", "auteur", "categorie"],
  auteurs: ["nom", "prenom"],
  adherents: ["nom", "email", "inscriptionDate"],
  emprunts: ["livre", "adherent", "date"],
  categories: ["nom"]
};

/* ===== Traductions (FR/EN/AR) ===== */
const translations = {
  fr: {
    dashboard: "Tableau de Bord", livres: "Livres", auteurs: "Auteurs",
    adherents: "Adhérents", emprunts: "Emprunts", categories: "Catégories",
    connexion: "Connexion", deconnexion: "Déconnexion", ajouter: "+ Ajouter",
    exporterCSV: "Exporter CSV", exporterPDF: "Exporter PDF"
  },
  en: {
    dashboard: "Dashboard", livres: "Books", auteurs: "Authors",
    adherents: "Members", emprunts: "Loans", categories: "Categories",
    connexion: "Sign in", deconnexion: "Sign out", ajouter: "+ Add",
    exporterCSV: "Export CSV", exporterPDF: "Export PDF"
  },
  ar: {
    dashboard: "لوحة التحكم", livres: "الكتب", auteurs: "المؤلفون",
    adherents: "الأعضاء", emprunts: "الإعارات", categories: "الفئات",
    connexion: "تسجيل الدخول", deconnexion: "تسجيل الخروج", ajouter: "+ إضافة",
    exporterCSV: "تصدير CSV", exporterPDF: "تصدير PDF"
  }
};

/* ===== Login handling ===== */
loginForm.onsubmit = e => {
  e.preventDefault();
  const u = usernameEl.value.trim();
  const p = passwordEl.value.trim();
  if (users.some(x => x.username === u && x.password === p)) {
    loginPage.classList.add("hidden");
    app.classList.remove("hidden");
    initStorage();
    showSection("dashboard");
  } else {
    loginError.textContent = "Connexion invalide";
    setTimeout(() => loginError.textContent = "", 2500);
  }
};

function logout() {
  app.classList.add("hidden");
  loginPage.classList.remove("hidden");
  loginForm.reset();
}

/* ===== Initialisation localStorage (exemples) ===== */
function initStorage() {
  if (!localStorage.getItem("livres")) {
    localStorage.setItem("livres", JSON.stringify([
      { titre: "1984", auteur: "George Orwell", categorie: "Roman" },
      { titre: "Le Petit Prince", auteur: "Antoine de Saint-Exupéry", categorie: "Conte" }
    ]));
  }
  if (!localStorage.getItem("auteurs")) {
    localStorage.setItem("auteurs", JSON.stringify([
      { nom: "Orwell", prenom: "George" },
      { nom: "Saint-Exupéry", prenom: "Antoine" }
    ]));
  }
  if (!localStorage.getItem("adherents")) {
    localStorage.setItem("adherents", JSON.stringify([
      { nom: "Ben", email: "ben@example.com", inscriptionDate: lastNDaysISO(30) }
    ]));
  }
  if (!localStorage.getItem("emprunts")) {
    localStorage.setItem("emprunts", JSON.stringify([]));
  }
  if (!localStorage.getItem("categories")) {
    localStorage.setItem("categories", JSON.stringify([
      { nom: "Roman" }, { nom: "Conte" }, { nom: "Science" }
    ]));
  }

  // render lists and dashboard
  keys.forEach(renderList);
  updateDashboard();
  renderAllCharts();
}

/* ===== Sidebar & navigation ===== */
function toggleSidebar() {
  const sidebar = document.getElementById("mySidebar");
  const isOpen = sidebar.style.width === "250px";
  sidebar.style.width = isOpen ? "0" : "250px";
}

function showSection(id) {
  document.querySelectorAll("main section").forEach(s => s.style.display = "none");
  const sec = document.getElementById(id);
  if (sec) sec.style.display = "block";
  const sidebar = document.getElementById("mySidebar");
  if (sidebar) sidebar.style.width = "0";
  updateDashboard();
  renderAllCharts();
}

/* ===== Recherche simple ===== */
function filterTable() {
  const q = (searchInput.value || "").toLowerCase();
  const active = Array.from(document.querySelectorAll("main section")).find(s => s.style.display !== "none");
  if (!active) return;
  const rows = active.querySelectorAll("table tr");
  rows.forEach((r, i) => {
    if (i === 0) return;
    r.style.display = r.textContent.toLowerCase().includes(q) ? "" : "none";
  });
}

/* ===== Dashboard compteurs ===== */
function updateDashboard() {
  keys.forEach(k => {
    const el = document.getElementById("count-" + k);
    if (el) {
      const arr = JSON.parse(localStorage.getItem(k) || "[]");
      el.textContent = arr.length;
    }
  });
}

/* ===== CRUD simple ===== */
let currentEntity = null;
let editIndex = null;

function showForm(entity, i = null) {
  currentEntity = entity;
  editIndex = i;
  formPopup.classList.remove("hidden");
  formFields.innerHTML = "";
  formTitle.textContent = (i === null ? "Ajouter " : "Modifier ") + entity;

  const data = i !== null ? JSON.parse(localStorage.getItem(entity))[i] : {};
  fields[entity].forEach(f => {
    const value = data[f] || (f === "date" || f === "inscriptionDate" ? todayISO() : "");
    const type = f === "email" ? "email" : (f === "date" || f === "inscriptionDate" ? "date" : "text");
    formFields.innerHTML += `<input name="${f}" type="${type}" value="${value}" placeholder="${f}" required style="display:block; width:100%; margin-bottom:10px; padding:8px;">`;
  });
}

function closeForm() {
  formPopup.classList.add("hidden");
  entityForm.reset();
}

entityForm.onsubmit = e => {
  e.preventDefault();
  const arr = JSON.parse(localStorage.getItem(currentEntity) || "[]");
  const obj = {};
  [...e.target.elements].forEach(el => {
    if (el.name) obj[el.name] = el.value;
  });
  if (editIndex !== null) arr[editIndex] = obj;
  else arr.push(obj);
  localStorage.setItem(currentEntity, JSON.stringify(arr));
  closeForm();
  renderList(currentEntity);
  updateDashboard();
  renderAllCharts();
};

/* ===== Render lists ===== */
function renderList(entity) {
  const arr = JSON.parse(localStorage.getItem(entity) || "[]");
  const container = document.getElementById(entity + "-list");
  if (!container) return;
  if (!arr.length) {
    container.innerHTML = "<p style='color:white;'>Aucun élément</p>";
    return;
  }

  const headers = Object.keys(arr[0]);
  let html = "<table><tr>";
  headers.forEach(h => html += `<th>${h}</th>`);
  html += "<th>Actions</th></tr>";

  arr.forEach((item, idx) => {
    html += "<tr>";
    headers.forEach(h => html += `<td>${item[h] ?? ""}</td>`);
    html += `<td>
      <button onclick="showForm('${entity}', ${idx})" style="background:#f39c12;color:white;border:none;padding:5px;cursor:pointer;">✏</button>
      <button onclick="delItem('${entity}', ${idx})" style="background:#e74c3c;color:white;border:none;padding:5px;cursor:pointer;">🗑</button>
    </td></tr>`;
  });

  html += "</table>";
  container.innerHTML = html;
}

function delItem(entity, idx) {
  if (!confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
  const arr = JSON.parse(localStorage.getItem(entity) || "[]");
  arr.splice(idx, 1);
  localStorage.setItem(entity, JSON.stringify(arr));
  renderList(entity);
  updateDashboard();
  renderAllCharts();
}

/* ===== Export CSV simple ===== */
function exportCSV(entity) {
  const arr = JSON.parse(localStorage.getItem(entity) || "[]");
  if (!arr.length) return alert("Aucune donnée à exporter");
  const header = Object.keys(arr[0]).join(",");
  const rows = arr.map(o => Object.values(o).map(v => `"${(v||"").toString().replace(/"/g,'""')}"`).join(","));
  const csv = header + "\n" + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = entity + ".csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ===== Export PDF simple via jsPDF (table as text) ===== */
async function exportPDF(entity) {
  const arr = JSON.parse(localStorage.getItem(entity) || "[]");
  if (!arr.length) return alert("Aucune donnée à exporter");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const title = entity.toUpperCase();
  doc.setFontSize(14);
  doc.text(title, 40, 40);

  const headers = Object.keys(arr[0]);
  const startY = 70;
  const rowHeight = 18;
  let y = startY;

  // header
  doc.setFontSize(10);
  headers.forEach((h, i) => {
    doc.text(h.toString(), 40 + i * 120, y);
  });
  y += rowHeight;

  // rows (simple, no wrapping)
  arr.forEach(row => {
    headers.forEach((h, i) => {
      const text = (row[h] ?? "").toString().slice(0, 40);
      doc.text(text, 40 + i * 120, y);
    });
    y += rowHeight;
    if (y > 750) { doc.addPage(); y = 40; }
  });

  doc.save(entity + ".pdf");
}

/* ===== Charts (Chart.js) - 5 graphiques ===== */
let charts = [];

function clearCharts() {
  charts.forEach(c => c && c.destroy && c.destroy());
  charts = [];
}

function renderAllCharts() {
  clearCharts();
  renderChartLivresByCategory();
  renderChartAuteurs();
  renderChartAdherents();
  renderChartEmprunts();
  renderChartCategoriesPie();
}

/* Chart 1: Livres par catégorie (bar) */
function renderChartLivresByCategory() {
  const ctx = document.getElementById("chartLivres");
  if (!ctx) return;
  const livres = JSON.parse(localStorage.getItem("livres") || "[]");
  const categories = JSON.parse(localStorage.getItem("categories") || "[]").map(c => c.nom);
  const labels = categories.length ? categories : ["Aucune catégorie"];
  const data = labels.map(cat => livres.filter(l => l.categorie === cat).length);
  charts.push(new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ label: "Livres", data, backgroundColor: "#3498db" }] },
    options: { responsive: true, maintainAspectRatio: false }
  }));
}

/* Chart 2: Auteurs (doughnut) */
function renderChartAuteurs() {
  const ctx = document.getElementById("chartAuteurs");
  if (!ctx) return;
  const auteurs = JSON.parse(localStorage.getItem("auteurs") || "[]");
  const labels = auteurs.map(a => `${a.prenom || ""} ${a.nom || ""}`.trim() || "—");
  const data = labels.map(() => 1);
  charts.push(new Chart(ctx, {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: generateColors(labels.length) }] },
    options: { responsive: true, maintainAspectRatio: false }
  }));
}

/* Chart 3: Adhérents inscriptions (line, last 6 months) */
function renderChartAdherents() {
  const ctx = document.getElementById("chartAdherents");
  if (!ctx) return;
  const adherents = JSON.parse(localStorage.getItem("adherents") || "[]");
  const months = lastNMonths(6);
  const data = months.map(m => adherents.filter(a => (a.inscriptionDate || "").startsWith(m)).length);
  charts.push(new Chart(ctx, {
    type: "line",
    data: { labels: months, datasets: [{ label: "Inscriptions", data, borderColor: "#2ecc71", backgroundColor: "rgba(46,204,113,0.2)", fill: true }] },
    options: { responsive: true, maintainAspectRatio: false }
  }));
}

/* Chart 4: Emprunts per month (bar, last 6 months) */
function renderChartEmprunts() {
  const ctx = document.getElementById("chartEmprunts");
  if (!ctx) return;
  const emprunts = JSON.parse(localStorage.getItem("emprunts") || "[]");
  const months = lastNMonths(6);
  const data = months.map(m => emprunts.filter(e => (e.date || "").startsWith(m)).length);
  charts.push(new Chart(ctx, {
    type: "bar",
    data: { labels: months, datasets: [{ label: "Emprunts", data, backgroundColor: "#f39c12" }] },
    options: { responsive: true, maintainAspectRatio: false }
  }));
}

/* Chart 5: Categories pie */
function renderChartCategoriesPie() {
  const ctx = document.getElementById("chartCategories");
  if (!ctx) return;
  const categories = JSON.parse(localStorage.getItem("categories") || "[]").map(c => c.nom);
  const livres = JSON.parse(localStorage.getItem("livres") || "[]");
  const data = categories.map(cat => livres.filter(l => l.categorie === cat).length);
  charts.push(new Chart(ctx, {
    type: "pie",
    data: { labels: categories, datasets: [{ data, backgroundColor: generateColors(categories.length) }] },
    options: { responsive: true, maintainAspectRatio: false }
  }));
}

/* Helpers for charts */
function generateColors(n) {
  const palette = ['#e74c3c','#2ecc71','#3498db','#9b59b6','#f1c40f','#e67e22','#1abc9c','#34495e'];
  const out = [];
  for (let i = 0; i < n; i++) out.push(palette[i % palette.length]);
  return out;
}

function lastNMonths(n) {
  const res = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    res.push(dt.toISOString().slice(0, 7)); // YYYY-MM
  }
  return res;
}

/* ===== Utilitaires ===== */
function todayISO() { return new Date().toISOString().slice(0, 10); }
function lastNDaysISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}


/* ===== INTERNATIONALISATION (simple) ===== */
function setLang(lang){
  const t = translations[lang] || translations.fr;
  document.getElementById('title-dashboard').textContent = t.dashboard;
  document.getElementById('title-livres').textContent = `Liste des ${t.livres}`;
  document.getElementById('title-auteurs').textContent = `Liste des ${t.auteurs}`;
  document.getElementById('title-adherents').textContent = `Liste des ${t.adherents}`;
  document.getElementById('title-emprunts').textContent = `Liste des ${t.emprunts}`;
  document.getElementById('title-categories').textContent = `Liste des ${t.categories}`;
  // Sidebar links
  document.querySelector("a[onclick=\"showSection('dashboard')\"]").textContent = ` ${t.dashboard}`;
  document.querySelector("a[onclick=\"showSection('livres')\"]").textContent = ` ${t.livres}`;
  document.querySelector("a[onclick=\"showSection('auteurs')\"]").textContent = ` ${t.auteurs}`;
  document.querySelector("a[onclick=\"showSection('adherents')\"]").textContent = ` ${t.adherents}`;
  document.querySelector("a[onclick=\"showSection('emprunts')\"]").textContent = ` ${t.emprunts}`;
  document.querySelector("a[onclick=\"showSection('categories')\"]").textContent = ` ${t.categories}`;

  // Update buttons text
  document.querySelectorAll("section").forEach(sec => {
    sec.querySelectorAll("button").forEach(btn => {
      if (btn.textContent.includes("+") || btn.textContent.toLowerCase().includes("ajouter") || btn.textContent.toLowerCase().includes("add")) {
        btn.textContent = t.ajouter;
      } else if (btn.textContent.toLowerCase().includes("csv") || btn.textContent.toLowerCase().includes("export")) {
        if (btn.textContent.toLowerCase().includes("pdf")) btn.textContent = t.exporterPDF;
        else btn.textContent = t.exporterCSV;
      }
    });
  });
}

/* ===== INITIAL CALLS WHEN LOADED ===== */
window.addEventListener('load', () => {
  // Hide sidebar on small screens
  document.getElementById("mySidebar").style.width = "0";
  // Ensure dashboard charts resize properly
  window.addEventListener('resize', () => renderAllCharts());
  // render lists if storage exists
  keys.forEach(k => renderList(k));
  updateDashboard();
  renderAllCharts();
  setLang('fr'); // default language
});
