let nav = document.getElementById("nav");
let btns = nav.getElementsByTagName("button");
let grid = document.getElementById("grid");
let title = document.getElementById("cat-title");
let scan = document.querySelector(".scanning-anim");

const API_KEY = "9a0843aa13a17e56841b821d4b659b169c4ea3944bfb4c6e0fed0c27e939ccef";
const BASE_URL = "https://marvelrivalsapi.com/api/v1";
const IMG_BASE = "https://marvelrivalsapi.com";

let curData = [];
let curCat = "";

async function init() {
    let urlParams = new URLSearchParams(window.location.search);
    let initialCat = urlParams.get('cat') || "maps";
    
    // Set initial active button
    Array.from(btns).forEach(b => {
        b.classList.remove("active");
        if (b.getAttribute("data-cat") === initialCat) {
            b.classList.add("active");
            title.innerText = b.innerText;
        }
    });

    loadCategory(initialCat, false);
}

// Handle Browser Back Button for categories
window.addEventListener("popstate", (e) => {
    let cat = e.state && e.state.cat ? e.state.cat : "maps";
    
    // Update active UI
    Array.from(btns).forEach(b => {
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
    
    // Fix missing /rivals prefix from some API endpoints (like achievements or items)
    if (img.startsWith("/") && !img.startsWith("/rivals/")) {
        img = "/rivals" + img;
    }
    
    return img.startsWith("/") ? IMG_BASE + img : img;
}

function render() {
    grid.innerHTML = "";

    curData.forEach((item, index) => {
        let name = item.name || item.full_name || item.displayName || "UNNAMED";

        let imgUrl = getImg(item);
        if (!imgUrl) return;

        let card = document.createElement("div");
        card.className = "card";
        card.dataset.idx = index;

        let img = document.createElement("img");
        img.className = "card-img";
        img.src = imgUrl;

        let h3 = document.createElement("h3");
        h3.className = "card-title";
        h3.textContent = name;

        let p = document.createElement("p");
        p.className = "card-desc";
        
        let descText = (item.description && item.description !== "0") ? item.description : (item.bio || item.mission || item.type || item.cost || "No description available.");
        p.textContent = descText;

        card.appendChild(img);
        card.appendChild(h3);
        card.appendChild(p);
        grid.appendChild(card);
    });
}

Array.from(btns).forEach(btn => {
    btn.addEventListener("click", e => {
        let cat = e.target.getAttribute("data-cat");
        if (cat === curCat) return;

        Array.from(btns).forEach(b => b.classList.remove("active"));
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

    // Pick the correct HTML file based on the category
    let targetFile = curCat === "heroes" ? "hero.html" 
                   : (curCat === "maps" ? "map.html" 
                   : (curCat === "items" ? "item.html" 
                   : (curCat === "battlepass" ? "battlepass.html" : "achievement.html")));
    
    // Open the new tab with URL parameters containing the data
    window.open(`${targetFile}?name=${name}&imgUrl=${imgUrl}&desc=${desc}`, "_blank");
});

init();
