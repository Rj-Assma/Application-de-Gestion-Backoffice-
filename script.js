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

/* ===== NAV ===== */
function showSection(id){
  document.querySelectorAll("section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
  updateDashboard();
}

/* ===== DASHBOARD ===== */
function updateDashboard(){
  keys.forEach(k=>{
    document.getElementById("count-"+k).textContent =
      JSON.parse(localStorage.getItem(k)).length;
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
  fields[entity].forEach(f=>{
    formFields.innerHTML+=`<input name="${f}" placeholder="${f}" required>`;
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
  if(!arr.length){div.innerHTML="Aucun élément"; return;}
  let html="<table><tr>"+Object.keys(arr[0]).map(k=>`<th>${k}</th>`).join("")+"<th>Actions</th></tr>";
  arr.forEach((o,i)=>{
    html+="<tr>"+Object.values(o).map(v=>`<td>${v}</td>`).join("")+
    `<td><button onclick="showForm('${entity}',${i})">✏</button>
    <button onclick="del('${entity}',${i})">🗑</button></td></tr>`;
  });
  div.innerHTML=html+"</table>";
}

function del(e,i){
  const a=JSON.parse(localStorage.getItem(e));
  a.splice(i,1);
  localStorage.setItem(e,JSON.stringify(a));
  renderList(e);
}
