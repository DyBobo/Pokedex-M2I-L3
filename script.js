const API_URL = "https://pokebuildapi.fr/api/v1/pokemon";
const input = document.getElementById("search-input");

// Charger l'historique sauvegardé
let searchHistory = JSON.parse(localStorage.getItem("pokedex-history")) || [];

function showError() {
    const popup = document.getElementById("error-popup");
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 3000);
}

// Recherche avec touche Entrée
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") search();
});

document.getElementById("search-btn").onclick = search;

async function search() {
    const name = input.value.trim();
    if (!name) return;

    try {
        const res = await fetch(`${API_URL}/${name}`);
        if (!res.ok) throw new Error();
        const p = await res.json();
        openModal(p);
        updateHistory(p);
    } catch {
        showError();
    }
}

function openModal(p) {
    const body = document.getElementById("modal-body");
    body.innerHTML = `
        <img src="${p.image}" width="150">
        <h2>${p.name.toUpperCase()}</h2>
        <p>Type: ${p.apiTypes.map(t => t.name).join(' / ')}</p>
        <div style="background:#f4f4f4; padding:10px; border-radius:10px; text-align:center;">
            PV: ${p.stats.HP} | Attaque: ${p.stats.attack}<br>
            Défense: ${p.stats.defense} | Vitesse: ${p.stats.speed}
        </div>
    `;
    document.getElementById("modal").style.display = "block";
}

function updateHistory(p) {
    if (!searchHistory.find(item => item.id === p.id)) {
        searchHistory.unshift(p);
        if (searchHistory.length > 5) searchHistory.pop();
        // Sauvegarde
        localStorage.setItem("pokedex-history", JSON.stringify(searchHistory));
        renderHistory();
    }
}

function renderHistory() {
    document.getElementById("history-container").innerHTML = searchHistory.map(p => 
        `<img src="${p.image}" onclick='openModal(${JSON.stringify(p)})'>`
    ).join('');
}

async function loadSuggestions() {
    const res = await fetch(API_URL);
    const all = await res.json();
    const shuffled = all.sort(() => 0.5 - Math.random()).slice(0, 5);
    document.getElementById("suggestion-container").innerHTML = shuffled.map(p => 
        `<img src="${p.image}" onclick='openModal(${JSON.stringify(p)})'>`
    ).join('');
}

document.querySelector(".close-btn").onclick = () => document.getElementById("modal").style.display = "none";
loadSuggestions();
renderHistory();