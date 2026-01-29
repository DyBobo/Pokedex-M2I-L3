const POKE_API = "https://pokeapi.co/api/v2/pokemon/";
const historyList = document.getElementById("history-list");
const searchResult = document.getElementById("search-result");
const randomContainer = document.getElementById("random-container");
const modal = document.getElementById("pokemon-modal");
const modalDetails = document.getElementById("modal-details");

let searchHistory = JSON.parse(localStorage.getItem("pokedex-history")) || [];

// 1. Recherche par nom ou ID
async function fetchPokemon(query) {
    if (!query) return;
    try {
        const response = await fetch(`${POKE_API}${query.toLowerCase()}`);
        if (response.ok === false) {
            searchResult.innerHTML = "<p class='error'>Aucun Pokémon trouvé</p>"; //
            return;
        }
        const data = await response.json();
        updateHistory(data.name);
        displaySearchResult(data);
    } catch (err) {
        console.error(err);
    }
}

// 2. Historique des 5 derniers
function updateHistory(name) {
    if (searchHistory.includes(name) === false) {
        searchHistory.unshift(name);
        if (searchHistory.length > 5) searchHistory.pop();
        localStorage.setItem("pokedex-history", JSON.stringify(searchHistory));
        displayHistory();
    }
}

function displayHistory() {
    historyList.innerHTML = "";
    searchHistory.forEach(name => {
        const span = document.createElement("button");
        span.textContent = name;
        span.onclick = () => fetchPokemon(name);
        historyList.appendChild(span);
    });
}

// 3. Fenêtre Modale (Poids, Taille, Stats)
function showModal(pokemon) {
    modalDetails.innerHTML = `
        <h2>${pokemon.name.toUpperCase()} (#${pokemon.id})</h2>
        <img src="${pokemon.sprites.front_default}" style="width:150px">
        <p><strong>Type(s) :</strong> ${pokemon.types.map(t => t.type.name).join(', ')}</p>
        <p><strong>Poids :</strong> ${pokemon.weight / 10} kg | <strong>Taille :</strong> ${pokemon.height / 10} m</p>
        <div class="stats">
            <strong>Statistiques :</strong><br>
            ${pokemon.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join(' | ')}
        </div>
    `;
    modal.style.display = "block";
}

// 4. 5 Recommandations aléatoires
async function loadRandom() {
    randomContainer.innerHTML = "Chargement...";
    const ids = Array.from({length: 5}, () => Math.floor(Math.random() * 898) + 1);
    randomContainer.innerHTML = "";
    for (let id of ids) {
        const res = await fetch(`${POKE_API}${id}`);
        const data = await res.json();
        const img = document.createElement("img");
        img.src = data.sprites.front_default;
        img.onclick = () => showModal(data);
        randomContainer.appendChild(img);
    }
}

function displaySearchResult(pokemon) {
    searchResult.innerHTML = `
        <div class="card">
            <img src="${pokemon.sprites.front_default}">
            <h3>${pokemon.name}</h3>
            <button onclick='showModal(${JSON.stringify(pokemon).replace(/'/g, "&apos;")})'>Détails</button>
        </div>
    `;
}

// Événements
document.getElementById("search-btn").onclick = () => fetchPokemon(document.getElementById("search-input").value);
document.querySelector(".close").onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

displayHistory();
loadRandom();