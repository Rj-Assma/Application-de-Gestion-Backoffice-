/* ===== USERS ===== */
const users = [
  { username: "assma", password: "1234" },
  { username: "admin", password: "admin" }
];

/* ===== DOM ELEMENTS ===== */
const loginForm = document.getElementById('login-form');
const usernameEl = document.getElementById('username');
const passwordEl = document.getElementById('password');
const loginPage = document.getElementById('login-page');
const app = document.getElementById('app');
const loginError = document.getElementById('login-error');
const formPopup = document.getElementById('form-popup');
const formFields = document.getElementById('form-fields');
const formTitle = document.getElementById('form-title');
const entityForm = document.getElementById('entity-form');
const keys = ["livres", "auteurs", "adherents", "emprunts", "categories"];

/* ===== FIELDS DEFINITION ===== */
const fields = {
  livres:    ["titre", "auteur", "categorie"],
  auteurs:   ["nom", "prenom"],
  adherents: ["nom", "prenom", "email", "inscriptionDate"],
  emprunts:  ["livre", "adherent", "date"],
  categories:["nom"]
};

/* ===== LOGIN ===== */
loginForm.onsubmit = e => {
  e.preventDefault();
  const u = usernameEl.value.trim(), p = passwordEl.value.trim();
  if (users.some(x => x.username === u && x.password === p)) {
    loginPage.classList.add("hidden");
    app.classList.remove("hidden");
    initStorage();
    showSection("dashboard");
  } else {
    loginError.textContent = "Connexion invalide";
    setTimeout(()=> loginError.textContent = "", 3000);
  }
};

function logout(){
  app.classList.add("hidden");
  loginPage.classList.remove("hidden");
  loginForm.reset();
}

/* ===== STORAGE INITIALIZATION ===== */
function initStorage(){
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
      { nom: "Ben", prenom: "Ali", email: "ben.ali@example.com", inscriptionDate: todayISO() }
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

  // Render all lists
  keys.forEach(renderList);
  updateDashboard();
  renderCharts();
}

/* ===== NAV & SIDEBAR ===== */
function toggleSidebar() {
  const sidebar = document.getElementById("mySidebar");
  const isOpen = sidebar.style.width === "250px";
  sidebar.style.width = isOpen ? "0" : "250px";
}

function showSection(id){
  document.querySelectorAll("main section").forEach(s => s.style.display = "none");
  const sec = document.getElementById(id);
  if (sec) sec.style.display = "block";
  const sidebar = document.getElementById("mySidebar");
  if (sidebar) sidebar.style.width = "0";
  updateDashboard();
  renderCharts();
}

/* ===== SEARCH FUNCTION ===== */
function filterTable() {
  const filter = document.getElementById("search-input").value.toLowerCase();
  const activeSection = Array.from(document.querySelectorAll("main section")).find(s => s.style.display !== "none");
  if (!activeSection) return;
  const rows = activeSection.querySelectorAll("table tr");
  rows.forEach((row, index) => {
    if (index === 0) return;
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  });
}

/* ===== DASHBOARD ===== */
function updateDashboard(){
  keys.forEach(k => {
    const countEl = document.getElementById("count-" + k);
    if (countEl) {
      const arr = JSON.parse(localStorage.getItem(k) || "[]");
      countEl.textContent = arr.length;
    }
  });
}

/* ===== UTILS ===== */
function todayISO(){ return new Date().toISOString().slice(0,10); }

function downloadBlob(filename, content, type){
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ===== CRUD FORM ===== */
let currentEntity = null, editIndex = null;

function showForm(entity, i = null){
  currentEntity = entity;
  editIndex = i;
  formPopup.classList.remove("hidden");
  formFields.innerHTML = "";
  formTitle.textContent = (i === null ? "Ajouter " : "Modifier ") + entity;

  const data = i !== null ? JSON.parse(localStorage.getItem(entity))[i] : {};

  fields[entity].forEach(f => {
    let value = data[f] || "";
    // For date fields, provide default today
    if (f.toLowerCase().includes("date") && !value) value = todayISO();
    formFields.innerHTML += `<input name="${f}" value="${value}" placeholder="${f}" ${f.includes("email") ? 'type="email"' : ''} required />`;
  });
}

function closeForm(){
  formPopup.classList.add("hidden");
  entityForm.reset();
}

/* Handle submit */
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
  renderCharts();
};

/* ===== RENDER LISTS & SORT ===== */
const sortState = {}; // track sort direction per entity/column

function renderList(entity){
  const arr = JSON.parse(localStorage.getItem(entity) || "[]");
  const div = document.getElementById(entity + "-list");
  if (!div) return;

  if (!arr.length) {
    div.innerHTML = "<p style='color:white;'>Aucun élément</p>";
    return;
  }

  // header keys
  const headers = Object.keys(arr[0]);
  let html = "<table><tr>";
  headers.forEach(h => {
    html += `<th onclick="sortTable('${entity}','${h}')">${h} ${sortState[entity+'_'+h] ? (sortState[entity+'_'+h] > 0 ? '▲' : '▼') : ''}</th>`;
  });
  html += "<th>Actions</th></tr>";

  arr.forEach((o, i) => {
    html += "<tr>";
    headers.forEach(k => html += `<td>${o[k] ?? ''}</td>`);
    html += `<td>
      <button onclick="showForm('${entity}',${i})" style="background:#f39c12;color:white;border:none;padding:5px;cursor:pointer;">✏</button>
      <button onclick="del('${entity}',${i})" style="background:#e74c3c;color:white;border:none;padding:5px;cursor:pointer;">🗑</button>
    </td></tr>`;
  });

  div.innerHTML = html + "</table>";
}

/* Sort function */
function sortTable(entity, key){
  const arr = JSON.parse(localStorage.getItem(entity) || "[]");
  const stateKey = entity + '_' + key;
  const dir = (sortState[stateKey] || -1) * -1; // toggle
  sortState[stateKey] = dir;

  arr.sort((a,b) => {
    const va = (a[key] || "").toString().toLowerCase();
    const vb = (b[key] || "").toString().toLowerCase();
    if (!isNaN(Date.parse(va)) && !isNaN(Date.parse(vb))) {
      return dir * (new Date(va) - new Date(vb));
    }
    if (!isNaN(va) && !isNaN(vb)) return dir * (va - vb);
    return dir * (va.localeCompare(vb));
  });

  localStorage.setItem(entity, JSON.stringify(arr));
  renderList(entity);
}

/* Delete */
function del(e, i){
  if (!confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
  const a = JSON.parse(localStorage.getItem(e) || "[]");
  a.splice(i,1);
  localStorage.setItem(e, JSON.stringify(a));
  renderList(e);
  updateDashboard();
  renderCharts();
}

/* ===== EXPORTS ===== */
function exportCSV(entity){
  const arr = JSON.parse(localStorage.getItem(entity) || "[]");
  if (!arr.length) return alert("Aucune donnée à exporter");
  const header = Object.keys(arr[0]).join(",");
  const rows = arr.map(o => Object.values(o).map(v => `"${(v||'').toString().replace(/"/g,'""')}"`).join(","));
  const csv = header + "\n" + rows.join("\n");
  downloadBlob(entity + ".csv", csv, "text/csv;charset=utf-8;");
}

function exportPDF(entity){
  const arr = JSON.parse(localStorage.getItem(entity) || "[]");
  if (!arr.length) return alert("Aucune donnée à exporter");
  // Simple printable HTML table in a new window, user can save as PDF via browser print
  let html = `<html><head><title>${entity}</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:6px;text-align:left}</style></head><body>`;
  html += `<h2>${entity}</h2><table><tr>`;
  Object.keys(arr[0]).forEach(k => html += `<th>${k}</th>`);
  html += `</tr>`;
  arr.forEach(o => {
    html += "<tr>";
    Object.values(o).forEach(v => html += `<td>${v ?? ''}</td>`);
    html += "</tr>";
  });
  html += `</table></body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

/* ===== CHARTS (Chart.js) ===== */
let charts = [];

function clearCharts(){
  charts.forEach(c => c.destroy && c.destroy());
  charts = [];
}

function renderCharts(){
  clearCharts();
  // Chart 1: Livres par catégorie
  const livres = JSON.parse(localStorage.getItem("livres") || "[]");
  const categories = JSON.parse(localStorage.getItem("categories") || "[]").map(c => c.nom);
  const catCounts = categories.map(cat => livres.filter(l => l.categorie === cat).length);
  const ctxL = document.getElementById('chartLivres').getContext('2d');
  charts.push(new Chart(ctxL, {
    type: 'bar',
    data: { labels: categories, datasets: [{ label: 'Livres', data: catCounts, backgroundColor: '#3498db' }] },
    options: { responsive:true, maintainAspectRatio:false }
  }));

  // Chart 2: Auteurs (count)
  const auteurs = JSON.parse(localStorage.getItem("auteurs") || "[]");
  const authorLabels = auteurs.map(a => `${a.prenom || ''} ${a.nom || ''}`.trim() || '—');
  const authorCounts = authorLabels.map(()=>1);
  const ctxA = document.getElementById('chartAuteurs').getContext('2d');
  charts.push(new Chart(ctxA, {
    type: 'doughnut',
    data: { labels: authorLabels, datasets: [{ data: authorCounts, backgroundColor: generateColors(authorLabels.length) }] },
    options: { responsive:true, maintainAspectRatio:false }
  }));

  // Chart 3: Adhérents inscriptions per month (last 6 months)
  const adherents = JSON.parse(localStorage.getItem("adherents") || "[]");
  const months = lastNMonths(6);
  const adhCounts = months.map(m => adherents.filter(a => (a.inscriptionDate || '').startsWith(m)).length);
  const ctxAd = document.getElementById('chartAdherents').getContext('2d');
  charts.push(new Chart(ctxAd, {
    type: 'line',
    data: { labels: months, datasets: [{ label: 'Inscriptions', data: adhCounts, borderColor:'#2ecc71', backgroundColor:'rgba(46,204,113,0.2)', fill:true }] },
    options: { responsive:true, maintainAspectRatio:false }
  }));

  // Chart 4: Emprunts per month (last 6 months)
  const emprunts = JSON.parse(localStorage.getItem("emprunts") || "[]");
  const empCounts = months.map(m => emprunts.filter(e => (e.date || '').startsWith(m)).length);
  const ctxE = document.getElementById('chartEmprunts').getContext('2d');
  charts.push(new Chart(ctxE, {
    type: 'bar',
    data: { labels: months, datasets: [{ label: 'Emprunts', data: empCounts, backgroundColor:'#f39c12' }] },
    options: { responsive:true, maintainAspectRatio:false }
  }));

  // Chart 5: Categories pie
  const ctxC = document.getElementById('chartCategories').getContext('2d');
  charts.push(new Chart(ctxC, {
    type: 'pie',
    data: { labels: categories, datasets: [{ data: catCounts, backgroundColor: generateColors(categories.length) }] },
    options: { responsive:true, maintainAspectRatio:false }
  }));
}

/* Helpers for charts */
function generateColors(n){
  const palette = ['#e74c3c','#2ecc71','#3498db','#9b59b6','#f1c40f','#e67e22','#1abc9c','#34495e'];
  const out = [];
  for(let i=0;i<n;i++) out.push(palette[i % palette.length]);
  return out;
}

function lastNMonths(n){
  const res = [];
  const d = new Date();
  for(let i = n-1; i >= 0; i--){
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const mm = dt.toISOString().slice(0,7); // YYYY-MM
    res.push(mm);
  }
  return res;
}

/* ===== INTERNATIONALISATION (simple) ===== */
const translations = {
  fr: { dashboard:"Tableau de Bord", livres:"Livres", auteurs:"Auteurs", adherents:"Adhérents", emprunts:"Emprunts", categories:"Catégories" },
  en: { dashboard:"Dashboard", livres:"Books", auteurs:"Authors", adherents:"Members", emprunts:"Loans", categories:"Categories" },
  ar: { dashboard:"لوحة التحكم", livres:"الكتب", auteurs:"المؤلفون", adherents:"الأعضاء", emprunts:"الإعارات", categories:"الفئات" }
};

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
}

/* ===== INITIAL CALLS WHEN LOADED ===== */
window.addEventListener('load', () => {
  // Hide sidebar on small screens
  document.getElementById("mySidebar").style.width = "0";
  // Ensure dashboard charts resize properly
  window.addEventListener('resize', () => renderCharts());
});
