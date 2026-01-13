/* ================= USERS ================= */
const users = [
  { username: "admin", password: "admin" },
  { username: "assma", password: "1234" }
];

/* ================= DOM ================= */
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
const globalSearchInput = document.getElementById("global-search");
const globalSearchBtn = document.getElementById("global-search-btn");

/* ================= ENTITIES ================= */
const keys = ["livres", "auteurs", "adherents", "emprunts", "categories"];
const fields = {
  livres: ["titre", "auteur", "categorie"],
  auteurs: ["nom", "prenom"],
  adherents: ["nom", "email", "inscriptionDate"],
  emprunts: ["livre", "adherent", "date"],
  categories: ["nom"]
};

/* ================= TRANSLATIONS ================= */
const translations = {
  fr: {
    dashboard: "Tableau de Bord",
    livres: "Livres",
    auteurs: "Auteurs",
    adherents: "Adhérents",
    emprunts: "Emprunts",
    categories: "Catégories"
  },
  en: {
    dashboard: "Dashboard",
    livres: "Books",
    auteurs: "Authors",
    adherents: "Members",
    emprunts: "Loans",
    categories: "Categories"
  },
  ar: {
    dashboard: "لوحة التحكم",
    livres: "الكتب",
    auteurs: "المؤلفون",
    adherents: "الأعضاء",
    emprunts: "الإعارات",
    categories: "الفئات"
  }
};

/* ================= LANGUAGE ================= */
function changeLanguage() {
  const lang = document.getElementById("lang").value;

  
  // Titres des sections
  document.getElementById("title-dashboard").textContent = translations[lang].dashboard;
  keys.forEach(k => {
    const el = document.getElementById("title-" + k);
    if (el) el.textContent = translations[lang][k];
  });

  // Menu sidebar
  document.getElementById("menu-dashboard").textContent = translations[lang].dashboard;
  document.getElementById("menu-livres").textContent = translations[lang].livres;
  document.getElementById("menu-auteurs").textContent = translations[lang].auteurs;
  document.getElementById("menu-adherents").textContent = translations[lang].adherents;
  document.getElementById("menu-emprunts").textContent = translations[lang].emprunts;
  document.getElementById("menu-categories").textContent = translations[lang].categories;
}
keys.forEach(k=>{
  const el=document.getElementById("title-"+k);
  if(el) el.textContent = translations[document.getElementById("lang").value][k];
});

/* ================= LOGIN ================= */
loginForm.onsubmit = e => {
  e.preventDefault();
  const u = usernameEl.value.trim();
  const p = passwordEl.value.trim();
  if(users.some(x => x.username === u && x.password === p)){
    loginPage.classList.add("hidden");
    app.classList.remove("hidden");
    initStorage();
    showSection("dashboard");
  } else {
    loginError.textContent = "Connexion invalide";
    setTimeout(()=>loginError.textContent="",2000);
  }
};

function logout(){
  app.classList.add("hidden");
  loginPage.classList.remove("hidden");
  loginForm.reset();
}

/* ================= STORAGE INIT ================= */
function initStorage(){
  keys.forEach(k=>{
    if(!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify([]));
  });
  renderAll();
}

/* ================= SIDEBAR ================= */
function toggleSidebar(){
  const s = document.getElementById("mySidebar");
  s.style.width = s.style.width === "250px" ? "0" : "250px";
}

function showSection(id){
  document.querySelectorAll("main section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
  document.getElementById("mySidebar").style.width="0";
}

/* ================= CRUD ================= */
let currentEntity = null;
let editIndex = null;

function showForm(entity, i=null){
  currentEntity = entity;
  editIndex = i;
  formPopup.classList.remove("hidden");
  formFields.innerHTML = "";
  formTitle.textContent = (i===null?"Ajouter ":"Modifier ") + entity;

  const data = i!==null ? JSON.parse(localStorage.getItem(entity))[i] : {};
  fields[entity].forEach(f=>{
    const type = f.includes("date") ? "date" : f==="email" ? "email":"text";
    formFields.innerHTML += `<input name="${f}" type="${type}" value="${data[f]||""}" placeholder="${f}" required>`;
  });
}

function closeForm(){
  formPopup.classList.add("hidden");
  entityForm.reset();
}

entityForm.onsubmit = e=>{
  e.preventDefault();
  const arr = JSON.parse(localStorage.getItem(currentEntity));
  const obj = {};
  [...e.target.elements].forEach(el=>el.name&&(obj[el.name]=el.value));
  editIndex!==null ? arr[editIndex]=obj : arr.push(obj);
  localStorage.setItem(currentEntity, JSON.stringify(arr));
  closeForm();
  renderAll();  // Render all tables immediately
};

/* ================= RENDER ================= */
function renderList(entity){
  const arr = JSON.parse(localStorage.getItem(entity));
  const div = document.getElementById(entity+"-list");
  if(!div) return;
  if(!arr.length){ div.innerHTML="<p style='color:white'>Aucun élément</p>"; return; }

  const headers = Object.keys(arr[0]);
  let html="<table><tr>";
  headers.forEach(h=>html+=`<th>${h}</th>`);
  html+="<th>Actions</th></tr>";
  arr.forEach((o,i)=>{
    html+="<tr>";
    headers.forEach(h=>html+=`<td>${o[h]}</td>`);
    html+=`<td>
      <button onclick="showForm('${entity}',${i})">✏</button>
      <button onclick="delItem('${entity}',${i})">🗑</button>
    </td></tr>`;
  });
  html+="</table>";
  div.innerHTML=html;
}

function delItem(entity,i){
  if(!confirm("Supprimer ?")) return;
  const arr=JSON.parse(localStorage.getItem(entity));
  arr.splice(i,1);
  localStorage.setItem(entity,JSON.stringify(arr));
  renderAll();
}

/* ================= DASHBOARD ================= */
function updateDashboard(){
  keys.forEach(k=>{
    const el=document.getElementById("count-"+k);
    if(el) el.textContent=JSON.parse(localStorage.getItem(k)).length;
  });
}

/* ================= GOOGLE BOOKS API ================= */
async function searchBooksAPI(){
  const q=globalSearchInput.value.trim();
  if(!q) return;
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`);
  const data = await res.json();
  displayAPIBooks(data.items||[]);
}

function displayAPIBooks(books){
  const c=document.getElementById("global-search-results");
  if(!books.length){ c.innerHTML="<p>No results</p>"; return; }

  c.innerHTML = books.slice(0,5).map(b=>{
    const i=b.volumeInfo;
    return `<div style="margin-bottom:10px;">
      <strong>${i.title||"No title"}</strong><br>
      ${i.authors?i.authors.join(", "):"Unknown"}<br>
      ${i.categories?i.categories[0]:"General"}<br>
      <button onclick="addBookFull(
        '${safe(i.title)}',
        '${safe(i.authors?i.authors.join("|"):"Unknown")}',
        '${safe(i.categories?i.categories[0]:"General")}'
      )">➕ Ajouter</button>
    </div>`;
  }).join("");
}

function safe(s){ return (s||"").replace(/'/g,"\\'"); }

/* ================= ADD BOOK + AUTOMATIC UPDATES ================= */
function addBookFull(title, authors, category){
  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

  // 1️⃣ Livres
  const livres = JSON.parse(localStorage.getItem("livres"))||[];
  if(!livres.some(b=>b.titre===title)){
    livres.push({ titre:title, auteur:authors.replace(/\|/g,", "), categorie:category });
    localStorage.setItem("livres", JSON.stringify(livres));
  }

  // 2️⃣ Auteurs
  const auteurs = JSON.parse(localStorage.getItem("auteurs"))||[];
  authors.split("|").forEach(a=>{
    const name=a.trim();
    if(!auteurs.some(x=>x.nom===name)){
      auteurs.push({ nom:name, prenom:"" });
    }
  });
  localStorage.setItem("auteurs", JSON.stringify(auteurs));

  // 3️⃣ Catégories
  const categories = JSON.parse(localStorage.getItem("categories"))||[];
  if(!categories.some(c=>c.nom===category)) categories.push({ nom:category });
  localStorage.setItem("categories", JSON.stringify(categories));

  // 4️⃣ Adhérents
  const adherents = JSON.parse(localStorage.getItem("adherents"))||[];
  const memberName = "Member of " + title;
  if(!adherents.some(a=>a.nom===memberName)){
    adherents.push({ nom:memberName, email:"", inscriptionDate:today });
  }
  localStorage.setItem("adherents", JSON.stringify(adherents));

  // 5️⃣ Emprunts
  const emprunts = JSON.parse(localStorage.getItem("emprunts"))||[];
  if(!emprunts.some(e=>e.livre===title && e.adherent===memberName)){
    emprunts.push({ livre:title, adherent:memberName, date:today });
  }
  localStorage.setItem("emprunts", JSON.stringify(emprunts));

  renderAll(); // Refresh all tables and dashboard
}

/* ================= GLOBAL SEARCH ================= */
function filterGlobal(){
  const q = globalSearchInput.value.toLowerCase();
  keys.forEach(k=>{
    const arr = JSON.parse(localStorage.getItem(k));
    const filtered = arr.filter(item=>{
      return Object.values(item).some(v=>v.toLowerCase().includes(q));
    });
    renderFilteredList(k, filtered);
  });
}

function renderFilteredList(entity, arr){
  const div = document.getElementById(entity+"-list");
  if(!div) return;
  if(!arr.length){ div.innerHTML="<p style='color:white'>Aucun résultat</p>"; return; }

  const headers = Object.keys(arr[0]);
  let html="<table><tr>";
  headers.forEach(h=>html+=`<th>${h}</th>`);
  html+="</tr>";
  arr.forEach(o=>{
    html+="<tr>";
    headers.forEach(h=>html+=`<td>${o[h]}</td>`);
    html+="</tr>";
  });
  html+="</table>";
  div.innerHTML=html;
}

/* ================= EXPORT ================= */
function exportCSV(entity){
  const arr=JSON.parse(localStorage.getItem(entity));
  if(!arr.length) return alert("Aucune donnée");
  const csv = Object.keys(arr[0]).join(",") + "\n" + arr.map(o=>Object.values(o).join(",")).join("\n");
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([csv]));
  a.download=entity+".csv";
  a.click();
}

async function exportPDF(entity){
  const arr=JSON.parse(localStorage.getItem(entity));
  if(!arr.length) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(entity.toUpperCase(), 20, 20);
  arr.forEach((o,i)=> doc.text(JSON.stringify(o),20,40+i*15));
  doc.save(entity+".pdf");
}

/* ================= RENDER ALL ================= */
function renderAll(){
  keys.forEach(renderList);
  updateDashboard();
  renderAllCharts();
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





/* ================= GLOBAL SEARCH EVENTS ================= */
globalSearchBtn.addEventListener("click", ()=>{
  filterGlobal();
  searchBooksAPI();
});

globalSearchInput.addEventListener("keyup",(e)=>{
  if(e.key==="Enter"){
    filterGlobal();
    searchBooksAPI();
  }
});

/* ================= INIT ================= */
window.onload = ()=>{
  document.getElementById("mySidebar").style.width="0";
  renderAll();
  changeLanguage();
};
