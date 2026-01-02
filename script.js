/* ============================================================
   1. VARIABLES ET ÉLÉMENTS DOM
   ============================================================ */
const users = [{ username: "assma", password: "0" }];
const keys = ["livres", "auteurs", "adherents", "emprunts"];

/* ============================================================
   2. GESTION DE LA CONNEXION
   ============================================================ */
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.onsubmit = e => {
        e.preventDefault();
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;

        if (users.some(x => x.username === u && x.password === p)) {
            document.getElementById('login-page').classList.add("hidden");
            document.getElementById('app').classList.remove("hidden");
            initStorage();
            showSection("dashboard");
        } else {
            document.getElementById('login-error').textContent = "Identifiants incorrects ✨";
        }
    };
}

function logout() {
    document.getElementById('app').classList.add("hidden");
    document.getElementById('login-page').classList.remove("hidden");
}

/* ============================================================
   3. NAVIGATION (SIDEBAR & NAVBAR)
   ============================================================ */
function toggleSidebar() {
    const sidebar = document.getElementById("mySidebar");
    // Alterne entre 0 et 250px
    if (sidebar.style.width === "250px") {
        sidebar.style.width = "0";
    } else {
        sidebar.style.width = "250px";
    }
}

function showSection(id) {
    // Cache toutes les sections
    document.querySelectorAll("main section").forEach(s => s.style.display = "none");
    // Affiche la section cible
    const section = document.getElementById(id);
    if (section) section.style.display = "block";
    
    // Ferme le menu après sélection
    const sidebar = document.getElementById("mySidebar");
    sidebar.style.width = "0";

    updateDashboard();
}

function changeLang(lang) {
    // Change l'apparence des boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Exemple de changement de texte simple
    const searchInput = document.getElementById('search-input');
    searchInput.placeholder = (lang === 'en') ? "🔍 Search something..." : "🔍 Rechercher un livre...";
}

/* ============================================================
   4. RECHERCHE FILTRÉE
   ============================================================ */
function filterTable() {
    const filter = document.getElementById("search-input").value.toLowerCase();
    const rows = document.querySelectorAll("main table tr");

    rows.forEach((row, index) => {
        if (index === 0) return; // Ignore l'en-tête
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}

/* ============================================================
   5. LOGIQUE CRUD (GESTION DES DONNÉES)
   ============================================================ */
function initStorage() {
    keys.forEach(k => {
        if (!localStorage.getItem(k)) {
            localStorage.setItem(k, "[]");
        }
        renderList(k);
    });
}

function updateDashboard() {
    keys.forEach(k => {
        const data = JSON.parse(localStorage.getItem(k) || "[]");
        const countEl = document.getElementById("count-" + k);
        if (countEl) countEl.textContent = data.length;
    });
}

function renderList(entity) {
    const data = JSON.parse(localStorage.getItem(entity) || "[]");
    const container = document.getElementById(entity + "-list");
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px; color:#ccc;'>C'est vide ici ✨</p>";
        return;
    }

    let html = "<table><tr>";
    // Création dynamique des en-têtes basés sur les clés du premier objet
    Object.keys(data[0]).forEach(key => html += `<th>${key.toUpperCase()}</th>`);
    html += "<th>ACTIONS</th></tr>";

    data.forEach((item, index) => {
        html += "<tr>";
        Object.values(item).forEach(val => html += `<td>${val}</td>`);
        html += `<td>
            <button onclick="deleteItem('${entity}', ${index})" style="background:none; border:none; cursor:pointer;">🗑️</button>
        </td></tr>`;
    });

    container.innerHTML = html + "</table>";
}

function deleteItem(entity, index) {
    if (confirm("Supprimer cet élément ? 🌸")) {
        const data = JSON.parse(localStorage.getItem(entity));
        data.splice(index, 1);
        localStorage.setItem(entity, JSON.stringify(data));
        renderList(entity);
        updateDashboard();
    }
}

/* ============================================================
   6. FORMULAIRES POPUP
   ============================================================ */
let currentEntity = "";

function showForm(entity) {
    currentEntity = entity;
    const popup = document.getElementById('form-popup');
    const fields = document.getElementById('form-fields');
    fields.innerHTML = ""; // Nettoie

    // Définition des champs
    const schemas = {
        livres: ["titre", "auteur", "categorie"],
        auteurs: ["nom", "prenom"],
        adherents: ["nom", "email"]
    };

    schemas[entity].forEach(f => {
        fields.innerHTML += `<input type="text" name="${f}" placeholder="${f.toUpperCase()}" required class="cute-input">`;
    });

    popup.classList.remove("hidden");
}

function closeForm() {
    document.getElementById('form-popup').classList.add("hidden");
}

document.getElementById('entity-form').onsubmit = e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const obj = {};
    formData.forEach((value, key) => obj[key] = value);

    const data = JSON.parse(localStorage.getItem(currentEntity));
    data.push(obj);
    localStorage.setItem(currentEntity, JSON.stringify(data));

    closeForm();
    renderList(currentEntity);
    updateDashboard();
    e.target.reset();
};
