let nav = document.getElementById("nav");
let btns = nav.getElementsByTagName("button");
let grid = document.getElementById("grid");
let title = document.getElementById("cat-title");
let scan = document.querySelector(".scanning-anim");
let searchBox = document.getElementById("search-box");
let filterBox = document.getElementById("filter-box");
let themeBtn = document.getElementById("theme-toggle");

const API_KEY = "9a0843aa13a17e56841b821d4b659b169c4ea3944bfb4c6e0fed0c27e939ccef";
const BASE_URL = "https://marvelrivalsapi.com/api/v1";
const IMG_BASE = "https://marvelrivalsapi.com";

let curData = [];
let curCat = "";

async function init() {
    let urlParams = new URLSearchParams(window.location.search);
    let initialCat = urlParams.get('cat') || "maps";
    
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-mode");
        themeBtn.innerText = "MODE: LIGHT";
    }

    Array.from(btns).map(b => {
        b.classList.remove("active");
        if (b.getAttribute("data-cat") === initialCat) {
            b.classList.add("active");
            title.innerText = b.innerText;
        }
    });

    loadCategory(initialCat, false);
}

themeBtn.addEventListener("click", () => {
    let isLight = document.body.classList.toggle("light-mode");
    themeBtn.innerText = isLight ? "MODE: LIGHT" : "MODE: DARK";
    localStorage.setItem("theme", isLight ? "light" : "dark");
});

window.addEventListener("popstate", (e) => {
    let cat = e.state && e.state.cat ? e.state.cat : "maps";
    
    Array.from(btns).map(b => {
        b.classList.remove("active");
        if (b.getAttribute("data-cat") === cat) {
            b.classList.add("active");
            title.innerText = b.innerText;
        }
    });

    loadCategory(cat, false);
});

async function loadCategory(cat, pushState = true) {
    if (pushState) {
        window.history.pushState({ cat: cat }, "", `?cat=${cat}`);
    }

    curCat = cat;
    grid.innerHTML = "";
    scan.style.display = "block";

    try {
        let r = await fetch(`${BASE_URL}/${cat}`, {
            headers: { "x-api-key": API_KEY }
        });
        let d = await r.json();

        if (cat === "maps") curData = d.maps || [];
        else if (cat === "heroes") curData = d.heroes || d.data || d || [];
        else if (cat === "achievements") curData = d.achievements || d.data || d || [];
        else if (cat === "items") curData = d.items || d.data || d || [];
        else if (cat === "battlepass") curData = d.items || d.data || d || [];
        else curData = d.data || d || [];

        populateFilters();
        render();
    } catch (e) {
        grid.textContent = "ERR: CONNECTION FAILED";
    } finally {
        scan.style.display = "none";
    }
}

function getImg(item) {
    let img = "";
    if (curCat === "maps") {
        let imgs = item.images || [];
        img = imgs.find(i => i.includes("/large/") || i.includes("/xl/")) || imgs.find(i => i.includes("/medium/")) || imgs[0];
    } else if (curCat === "heroes") {
        img = item.imageUrl || item.thumbnail || item.portrait || item.icon;
    } else {
        img = item.imageUrl || item.thumbnail || item.icon || item.image;
    }
    
    if (!img) return "";
    
    if (img.startsWith("/") && !img.startsWith("/rivals/")) {
        img = "/rivals" + img;
    }
    
    return img.startsWith("/") ? IMG_BASE + img : img;
}

function populateFilters() {
    searchBox.value = "";
    
    const uniqueFilters = [...new Set(curData.map(item => {
        let filterValue = item.role || item.game_mode || item.type || item.rarity || "";
        if (Array.isArray(filterValue) && filterValue.length > 0) filterValue = filterValue[0];
        return typeof filterValue === 'string' ? filterValue : "";
    }).filter(val => val !== ""))];

    filterBox.innerHTML = '<option value="all">ALL</option>' + 
        uniqueFilters.map(val => `<option value="${val}">${val.toUpperCase()}</option>`).join("");
}

function render() {
    let searchTerm = searchBox.value.toLowerCase();
    let filterTerm = filterBox.value;

    grid.innerHTML = curData
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => {
            let name = item.name || item.full_name || item.displayName || "UNNAMED";
            let filterValue = item.role || item.game_mode || item.type || item.rarity || "";
            if (Array.isArray(filterValue) && filterValue.length > 0) filterValue = filterValue[0];
            if (typeof filterValue !== "string") filterValue = "";

            if (filterTerm !== "all" && filterValue !== filterTerm) return false;
            if (searchTerm && !name.toLowerCase().includes(searchTerm)) return false;
            if (!getImg(item)) return false;
            return true;
        })
        .map(({ item, index }) => {
            let name = item.name || item.full_name || item.displayName || "UNNAMED";
            let imgUrl = getImg(item);
            let descText = (item.description && item.description !== "0") ? item.description : (item.bio || item.mission || item.type || item.cost || "No description available.");
            
            let safeName = name.replace(/"/g, '&quot;').replace(/</g, '&lt;');
            let safeDesc = descText.replace(/</g, '&lt;');
            
            return `
                <div class="card" data-idx="${index}">
                    <img class="card-img" src="${imgUrl}" alt="${safeName}">
                    <h3 class="card-title">${safeName}</h3>
                    <p class="card-desc">${safeDesc}</p>
                </div>
            `;
        })
        .join("");
}

Array.from(btns).map(btn => {
    btn.addEventListener("click", e => {
        let cat = e.target.getAttribute("data-cat");
        if (cat === curCat) return;

        Array.from(btns).map(b => b.classList.remove("active"));
        e.target.classList.add("active");
        title.innerText = e.target.innerText;

        loadCategory(cat, true);
    });
});

grid.addEventListener("click", e => {
    let card = e.target.closest(".card");
    if (!card) return;
    
    let item = curData[card.dataset.idx];
    let name = encodeURIComponent(item.name || item.full_name || item.displayName || "UNNAMED");
    let imgUrl = encodeURIComponent(getImg(item));
    let descText = (item.description && item.description !== "0") ? item.description : (item.bio || item.mission || item.type || item.cost || "No description available.");
    let desc = encodeURIComponent(descText);

    let targetFile = curCat === "heroes" ? "hero.html" 
                    : (curCat === "maps" ? "map.html" 
                    : (curCat === "items" ? "item.html" 
                    : (curCat === "battlepass" ? "battlepass.html" : "achievement.html")));
    
    window.open(`${targetFile}?name=${name}&imgUrl=${imgUrl}&desc=${desc}`, "_blank");
});

searchBox.addEventListener("input", render);
filterBox.addEventListener("change", render);

init();
