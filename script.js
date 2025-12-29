/* ===== USERS ===== */
const users = [{username:"assma",password:"1234"}];

/* ===== DOM ELEMENTS ===== */
const loginForm = document.getElementById('login-form');
const username = document.getElementById('username');
const password = document.getElementById('password');
const loginPage = document.getElementById('login-page');
const app = document.getElementById('app');
const loginError = document.getElementById('login-error');
const formPopup = document.getElementById('form-popup');
const formFields = document.getElementById('form-fields');
const formTitle = document.getElementById('form-title');
const entityForm = document.getElementById('entity-form');

/* ===== LOGIN ===== */
loginForm.onsubmit = e => {
  e.preventDefault();
  const u = username.value, p = password.value;
  if(users.some(x=>x.username===u && x.password===p)){
    loginPage.classList.add("hidden");
    app.classList.remove("hidden");
    initStorage();
    showSection("dashboard");
  } else loginError.textContent="Connexion invalide";
};

function logout(){
  app.classList.add("hidden");
  loginPage.classList.remove("hidden");
}

/* ===== STORAGE ===== */
const keys=["livres","auteurs","adherents","emprunts","categories"];

function initStorage(){
  if(!localStorage.getItem("livres")){
    localStorage.setItem("livres",JSON.stringify([
      {titre:"1984",auteur:"George Orwell",categorie:"Roman"},
      {titre:"Le Petit Prince",auteur:"Antoine de Saint-Exupéry",categorie:"Conte"}
    ]));
  }
  keys.slice(1).forEach(k=>{
    if(!localStorage.getItem(k)) localStorage.setItem(k,"[]");
  });
  keys.forEach(renderList);
}

/* ===== NAV & SIDEBAR ===== */

function toggleSidebar() {
    const sidebar = document.getElementById("mySidebar");
    const isOpen = sidebar.style.width === "250px";
    sidebar.style.width = isOpen ? "0" : "250px";
}

function showSection(id){
    document.querySelectorAll("section").forEach(s=>s.style.display="none");
    document.getElementById(id).style.display="block";
    
   
    const sidebar = document.getElementById("mySidebar");
    if(sidebar) sidebar.style.width = "0";
    
    updateDashboard();
}

/* ===== SEARCH FUNCTION ===== */

function filterTable() {
    const filter = document.getElementById("search-input").value.toLowerCase();

    const activeSection = document.querySelector('section:not([style*="display: none"])');
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
  keys.forEach(k=>{
    const countEl = document.getElementById("count-"+k);
    if(countEl) {
        countEl.textContent = JSON.parse(localStorage.getItem(k)).length;
    }
  });
}

/* ===== CRUD ===== */
let currentEntity=null, editIndex=null;

const fields={
  livres:["titre","auteur","categorie"],
  auteurs:["nom","prenom"],
  adherents:["nom","prenom","email"],
  emprunts:["livre","adherent","date"],
  categories:["nom"]
};

function showForm(entity,i=null){
  currentEntity=entity; editIndex=i;
  formPopup.classList.remove("hidden");
  formFields.innerHTML="";
  formTitle.textContent=i===null?"Ajouter":"Modifier";
  
  const data = i !== null ? JSON.parse(localStorage.getItem(entity))[i] : {};

  fields[entity].forEach(f=>{
    const val = data[f] || "";
    formFields.innerHTML+=`<input name="${f}" value="${val}" placeholder="${f}" required style="display:block; width:100%; margin-bottom:10px; padding:8px;">`;
  });
}

function closeForm(){ formPopup.classList.add("hidden"); }

entityForm.onsubmit=e=>{
  e.preventDefault();
  const arr=JSON.parse(localStorage.getItem(currentEntity));
  const obj={};
  [...e.target.elements].forEach(i=>i.name&&(obj[i.name]=i.value));
  editIndex!==null?arr[editIndex]=obj:arr.push(obj);
  localStorage.setItem(currentEntity,JSON.stringify(arr));
  closeForm(); renderList(currentEntity);
};

function renderList(entity){
  const arr=JSON.parse(localStorage.getItem(entity));
  const div=document.getElementById(entity+"-list");
  if(!div) return;
  if(!arr.length){div.innerHTML="<p style='color:white;'>Aucun élément</p>"; return;}
  
  let html="<table><tr>"+Object.keys(arr[0]).map(k=>`<th>${k}</th>`).join("")+"<th>Actions</th></tr>";
  arr.forEach((o,i)=>{
    html+="<tr>"+Object.values(o).map(v=>`<td>${v}</td>`).join("")+
    `<td><button onclick="showForm('${entity}',${i})" style="background:#f39c12; color:white; border:none; padding:5px; cursor:pointer;">✏</button>
    <button onclick="del('${entity}',${i})" style="background:#e74c3c; color:white; border:none; padding:5px; cursor:pointer;">🗑</button></td></tr>`;
  });
  div.innerHTML=html+"</table>";
}

function del(e,i){
  if(confirm("Voulez-vous vraiment supprimer cet élément ?")){
      const a=JSON.parse(localStorage.getItem(e));
      a.splice(i,1);
      localStorage.setItem(e,JSON.stringify(a));
      renderList(e);
      updateDashboard();
  }
}
