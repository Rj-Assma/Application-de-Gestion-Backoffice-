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
const globalSearchResults = document.getElementById("global-search-results");

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
    bibliotheque:"Bibliothèque",
    dashboard:"",
    livres:"Livres",
    auteurs:"Auteurs",
    adherents:"Adhérents",
    emprunts:"Emprunts",
    categories:"Catégories",
    logout:"Déconnexion",
    rechercher:"Rechercher"
  },
  en: {
    bibliotheque:"Library",
    dashboard:"Dashboard",
    livres:"Books",
    auteurs:"Authors",
    adherents:"Members",
    emprunts:"Loans",
    categories:"Categories",
    logout:"Logout",
    rechercher:"Search"
  },
  ar: {
    bibliotheque:"المكتبة",
    dashboard:"لوحة التحكم",
    livres:"الكتب",
    auteurs:"المؤلفون",
    adherents:"الأعضاء",
    emprunts:"الإعارات",
    categories:"الفئات",
    logout:"تسجيل الخروج",
    rechercher:"بحث"
  }
};

/* ================= LANGUAGE ================= */
function changeLanguage(){
  const lang = document.getElementById("lang").value;
  localStorage.setItem("lang", lang);   
  document.body.dir = lang==="ar" ? "rtl" : "ltr";

  document.getElementById("title-biblio").textContent = translations[lang].bibliotheque;
  document.getElementById("title-dashboard").textContent = translations[lang].dashboard;
  document.getElementById("title-livres").textContent = translations[lang].livres;
  document.getElementById("title-auteurs").textContent = translations[lang].auteurs;
  document.getElementById("title-adherents").textContent = translations[lang].adherents;
  document.getElementById("title-emprunts").textContent = translations[lang].emprunts;
  document.getElementById("title-categories").textContent = translations[lang].categories;
  document.getElementById("deconexion").textContent = translations[lang].logout;
  document.getElementById("global-search-btn").textContent = translations[lang].rechercher;
}




/* ================= CHARTS ================= */
let charts = [];
function renderAllCharts(){
  // destroy old charts
  charts.forEach(c => c.destroy());
  charts = [];

  // ===== Livres par catégorie =====
  const livres = JSON.parse(localStorage.getItem("livres")) || [];
  const categoriesCount = {};
  livres.forEach(l => { categoriesCount[l.categorie] = (categoriesCount[l.categorie]||0)+1; });
  const ctx1 = document.getElementById("chartLivres").getContext("2d");
  const chart1 = new Chart(ctx1, {
    type: "bar",
    data: {
      labels: Object.keys(categoriesCount),
      datasets: [{ label:"Livres par catégorie", data:Object.values(categoriesCount), backgroundColor:"#996346" }]
    }
  });
  charts.push(chart1);

  // ===== Livres par auteur =====
  const auteurs = JSON.parse(localStorage.getItem("auteurs")) || [];
  const livresParAuteur = {};
  livres.forEach(l => l.auteur.split(", ").forEach(a => { livresParAuteur[a] = (livresParAuteur[a]||0)+1; }));
  const ctx2 = document.getElementById("chartAuteurs").getContext("2d");
  const chart2 = new Chart(ctx2, {
    type:"bar",
    data: { labels:Object.keys(livresParAuteur), datasets:[{label:"Livres par auteur", data:Object.values(livresParAuteur), backgroundColor:"#64402e"}] }
  });
  charts.push(chart2);

  // ===== Inscriptions adhérents =====
  const adherents = JSON.parse(localStorage.getItem("adherents")) || [];
  const ctx3 = document.getElementById("chartAdherents").getContext("2d");
  const chart3 = new Chart(ctx3, {
    type:"line",
    data: { labels:adherents.map(a=>a.nom), datasets:[{label:"Adhérents", data:adherents.map(()=>1), backgroundColor:"#9c7a74"}] }
  });
  charts.push(chart3);

  // ===== Emprunts =====
  const emprunts = JSON.parse(localStorage.getItem("emprunts")) || [];
  const empruntsCount = {};
  emprunts.forEach(e => { empruntsCount[e.livre] = (empruntsCount[e.livre]||0)+1; });
  const ctx4 = document.getElementById("chartEmprunts").getContext("2d");
  const chart4 = new Chart(ctx4, {
    type:"bar",
    data: { labels:Object.keys(empruntsCount), datasets:[{label:"Emprunts", data:Object.values(empruntsCount), backgroundColor:"#b0af9e"}] }
  });
  charts.push(chart4);

  // ===== Part des catégories =====
  const ctx5 = document.getElementById("chartCategories").getContext("2d");
  const chart5 = new Chart(ctx5, {
    type:"pie",
    data: { labels:Object.keys(categoriesCount), datasets:[{label:"Catégories", data:Object.values(categoriesCount), backgroundColor:["#996346","#64402e","#9c7a74","#b0af9e","#514f4a"]}] }
  });
  charts.push(chart5);
}

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
    renderAllCharts(); // render charts after login
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

  if(!localStorage.getItem("livres")){
    localStorage.setItem("livres", JSON.stringify([
      { titre:"1984", auteur:"George Orwell", categorie:"Roman" },
      { titre:"Le Petit Prince", auteur:"Antoine de Saint-Exupéry", categorie:"Conte" }
    ]));
  }

  if(!localStorage.getItem("auteurs")){
    localStorage.setItem("auteurs", JSON.stringify([
      { nom:"George Orwell", prenom:"" },
      { nom:"Antoine de Saint-Exupéry", prenom:"" }
    ]));
  }

  if(!localStorage.getItem("categories")){
    localStorage.setItem("categories", JSON.stringify([
      { nom:"Roman" },
      { nom:"Conte" }
    ]));
  }

  if(!localStorage.getItem("adherents")){
    localStorage.setItem("adherents", JSON.stringify([
      { nom:"Ahmed", email:"ahmed@mail.com", inscriptionDate:"2024-01-10" }
    ]));
  }

  if(!localStorage.getItem("emprunts")){
    localStorage.setItem("emprunts", JSON.stringify([
      { livre:"1984", adherent:"Ahmed", date:"2024-01-15" }
    ]));
  }

  keys.forEach(renderList);
  updateDashboard();
}


/* ================= SIDEBAR ================= */
function toggleSidebar(){
  const s = document.getElementById("mySidebar");
  s.style.width = s.style.width==="250px"?"0":"250px";
}

function showSection(id){
  document.querySelectorAll("main section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";

  const s = document.getElementById("mySidebar");
  if(s.style.width === "250px") s.style.width = "0";
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

entityForm.onsubmit = e => {
  e.preventDefault();

  const obj = {};
  [...e.target.elements].forEach(el => {
    if(el.name) obj[el.name] = el.value.trim();
  });

  // VALIDATION AVANT TOUT
  if(Object.values(obj).some(v => v === "")){
    alert("Tous les champs sont obligatoires");
    return;
  }

  const arr = JSON.parse(localStorage.getItem(currentEntity));
  editIndex !== null ? arr[editIndex] = obj : arr.push(obj);
  localStorage.setItem(currentEntity, JSON.stringify(arr));

  closeForm();
  renderList(currentEntity);
  updateDashboard();
  renderAllCharts();
};


/* ================= RENDER LIST ================= */
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
  renderList(entity);
  updateDashboard();
  renderAllCharts(); // update charts
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
  const q = globalSearchInput.value.trim();
  if(!q) { globalSearchResults.style.display='none'; return; }
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`);
  const data = await res.json();
  displayAPIBooks(data.items||[]);
}

function displayAPIBooks(books){
  if(!books.length){
    globalSearchResults.innerHTML = "<p>No results</p>";
    globalSearchResults.style.display='block';
    return;
  }
  globalSearchResults.innerHTML = books.slice(0,5).map(b=>{
    const i=b.volumeInfo;
    return `<div>
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
  globalSearchResults.style.display='block';
}

function safe(s){ return (s||"").replace(/'/g,"\\'"); }

/* ================= ADD BOOK FULL ================= */
function addBookFull(title, authors, category){
  const today = new Date().toISOString().split("T")[0];

  const livres = JSON.parse(localStorage.getItem("livres"))||[];
  if(!livres.some(b=>b.titre===title)){
    livres.push({ titre:title, auteur:authors.replace(/\|/g,", "), categorie:category });
    localStorage.setItem("livres", JSON.stringify(livres));
    renderList("livres");
  }

  const auteurs = JSON.parse(localStorage.getItem("auteurs"))||[];
  authors.split("|").forEach(a=>{
    const name=a.trim();
    if(!auteurs.some(x=>x.nom===name)) auteurs.push({ nom:name, prenom:"" });
  });
  localStorage.setItem("auteurs", JSON.stringify(auteurs));
  renderList("auteurs");

  const categories = JSON.parse(localStorage.getItem("categories"))||[];
  if(!categories.some(c=>c.nom===category)) categories.push({ nom:category });
  localStorage.setItem("categories", JSON.stringify(categories));
  renderList("categories");

  const adherents = JSON.parse(localStorage.getItem("adherents"))||[];
  const memberName="Member of "+title;
  if(!adherents.some(a=>a.nom===memberName)) adherents.push({ nom:memberName, email:"", inscriptionDate:today });
  localStorage.setItem("adherents", JSON.stringify(adherents));
  renderList("adherents");

  const emprunts = JSON.parse(localStorage.getItem("emprunts"))||[];
  if(!emprunts.some(e=>e.livre===title && e.adherent===memberName)) emprunts.push({ livre:title, adherent:memberName, date:today });
  localStorage.setItem("emprunts", JSON.stringify(emprunts));
  renderList("emprunts");

  updateDashboard();
  renderAllCharts(); // update charts
}

/* ================= GLOBAL SEARCH ================= */
function filterGlobal(){
  const q = globalSearchInput.value.toLowerCase();
  keys.forEach(k=>{
    const arr = JSON.parse(localStorage.getItem(k));
    const filtered = arr.filter(item =>Object.values(item).some(v =>String(v).toLowerCase().includes(q)));
    renderFilteredList(k, filtered);
    if(!q){
      renderList(k);
      globalSearchResults.innerHTML=""; // clear API results
      return;
    }
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
  const csv=Object.keys(arr[0]).join(",") + "\n" + arr.map(o=>Object.values(o).join(",")).join("\n");
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



/* ================= INIT ================= */
window.onload = () => {
  document.getElementById("mySidebar").style.width = "0";

  const savedLang = localStorage.getItem("lang") || "fr";
  document.getElementById("lang").value = savedLang;

  initStorage();
  renderAllCharts();
  changeLanguage();   

  globalSearchBtn.addEventListener("click", () => {
    filterGlobal();
    searchBooksAPI();
  });

  globalSearchInput.addEventListener("keyup", e => {
    if(e.key === "Enter"){
      filterGlobal();
      searchBooksAPI();
    }
  });
};

