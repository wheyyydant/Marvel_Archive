let nav = document.getElementById("nav")
let btns = nav.getElementsByTagName("button")
let grid = document.getElementById("grid")
let title = document.getElementById("cat-title")
let scan = document.querySelector(".scanning-anim")
let sBox = document.getElementById("search-box")
let fBox = document.getElementById("filter-box")
let modOver = document.getElementById("modal-overlay")
let modBody = document.getElementById("modal-body")
let modClose = document.getElementById("modal-close")

const API_KEY = "9a0843aa13a17e56841b821d4b659b169c4ea3944bfb4c6e0fed0c27e939ccef"
const BASE_URL = "https://marvelrivalsapi.com/api/v1"
const IMG_BASE = "https://marvelrivalsapi.com"

let curData = []
let curCat = ""

async function init() {
    f("maps")
}

async function f(c) {
    curCat = c
    grid.innerHTML = ""
    scan.style.display = "block"

    let endpoint = BASE_URL + "/" + c

    try {
        let r = await fetch(endpoint, {
            headers: { "x-api-key": API_KEY }
        })
        let d = await r.json()

        // Different endpoints return data differently
        if (c === "maps") {
            curData = d.maps || []
        } else if (c === "heroes") {
            curData = d.heroes || d.data || d || []
        } else if (c === "gamemodes") {
            curData = d.gamemodes || d.data || d || []
        } else {
            curData = d.data || d || []
        }

        // Build filter options
        let fs = ["ALL"]
        for (let i = 0; i < curData.length; i++) {
            let item = curData[i]
            if (c === "maps" && item.game_mode) {
                let gm = item.game_mode.toUpperCase()
                let ok = false
                for (let j = 0; j < fs.length; j++) {
                    if (fs[j] === gm) ok = true
                }
                if (!ok) fs[fs.length] = gm
            }
            if (c === "heroes" && item.role) {
                let rn = (item.role || "").toUpperCase()
                let ok = false
                for (let j = 0; j < fs.length; j++) {
                    if (fs[j] === rn) ok = true
                }
                if (!ok) fs[fs.length] = rn
            }
        }

        let fh = ""
        for (let i = 0; i < fs.length; i++) {
            fh += "<option value='" + fs[i] + "'>" + fs[i] + "</option>"
        }
        fBox.innerHTML = fh
        fBox.value = "ALL"

        if (fs.length > 1) {
            fBox.style.display = "inline-block"
        } else {
            fBox.style.display = "none"
        }

        sBox.value = ""
        render()
        scan.style.display = "none"

    } catch (e) {
        grid.innerHTML = "<p>ERR: CONNECTION FAILED</p>"
        scan.style.display = "none"
    }
}

function getImg(item) {
    if (curCat === "maps") {
        // Prefer large or medium image, fallback to first
        let imgs = item.images || []
        let large = imgs.find(i => i.includes("/large/") || i.includes("/xl/"))
        let medium = imgs.find(i => i.includes("/medium/"))
        let chosen = large || medium || imgs[0] || ""
        if (chosen && chosen.startsWith("/")) return IMG_BASE + chosen
        return chosen
    }
    if (curCat === "heroes") {
        let img = item.thumbnail || item.portrait || item.icon || ""
        if (img && img.startsWith("/")) return IMG_BASE + img
        return img
    }
    let img = item.thumbnail || item.icon || item.image || ""
    if (img && img.startsWith("/")) return IMG_BASE + img
    return img
}

function render() {
    let q = sBox.value.toLowerCase()
    let fv = fBox.value
    let h = ""

    for (let i = 0; i < curData.length; i++) {
        let item = curData[i]

        if (curCat === "maps" && fv !== "ALL") {
            if (!item.game_mode || item.game_mode.toUpperCase() !== fv) continue
        }
        if (curCat === "heroes" && fv !== "ALL") {
            if (!item.role || item.role.toUpperCase() !== fv) continue
        }

        let n = item.name || item.full_name || item.displayName || "UNNAMED"
        if (q !== "") {
            if (n.toLowerCase().indexOf(q) === -1) continue
        }

        let desc = item.description || ""
        let img = getImg(item)

        if (!img) continue

        let tags = ""
        if (curCat === "maps") {
            if (item.game_mode) tags += "<span>MODE: " + item.game_mode.toUpperCase() + "</span>"
            if (item.location) tags += "<span>LOC: " + item.location.toUpperCase() + "</span>"
            if (typeof item.is_competitive !== "undefined") {
                tags += "<span>" + (item.is_competitive ? "COMPETITIVE" : "CASUAL") + "</span>"
            }
        }
        if (curCat === "heroes") {
            if (item.role) tags += "<span>ROLE: " + item.role.toUpperCase() + "</span>"
            if (item.difficulty) tags += "<span>DIFF: " + item.difficulty + "</span>"
        }

        let wordsList = ["MARVEL", "RIVALS", "ASSEMBLE", "ONLINE", "SYS.0X", "PROTOCOL"]
        let w1 = wordsList[Math.floor(Math.random() * wordsList.length)]
        let w2 = wordsList[Math.floor(Math.random() * wordsList.length)]
        let edgePos = [
            {t:"8%", l:"8%"}, {t:"12%", l:"85%"}, {t:"50%", l:"5%"}, {t:"30%", l:"85%"}, {t:"80%", l:"80%"}
        ]
        let dec = ""
        let numSq = Math.floor(Math.random() * 3) + 2
        for (let s = 0; s < numSq; s++) {
            if (edgePos.length === 0) break
            let p = edgePos.splice(Math.floor(Math.random() * edgePos.length), 1)[0]
            let size = Math.floor(Math.random() * 6) + 4
            dec += "<div class='sq' style='top:" + p.t + "; left:" + p.l + "; width:" + size + "px; height:" + size + "px;'></div>"
        }

        let html = "<div class='card' data-idx='" + i + "'>" +
            "<div class='card-decor'>" +
                dec +
                "<div class='txt txt-1'>" + w1 + "</div><div class='txt txt-2'>" + w2 + "</div>" +
                "<div class='dots' style='top:8%; right:8%;'>::</div><div class='dots' style='top:40%; left:5%; transform:rotate(90deg);'>::</div>" +
            "</div>" +
            "<img class='card-img' src='" + img + "' alt='img' loading='lazy'>" +
            "<h3 class='card-title'>" + n + "</h3>" +
            "<div class='card-hud'>" +
                tags +
            "</div>" +
            "<p class='card-desc'>" + desc + "</p>" +
            "<div class='progress-bar'><div class='progress-fill' style='width:" + (Math.random() * 60 + 20) + "%'></div></div>" +
        "</div>"

        h += html
    }

    grid.innerHTML = h
}

sBox.addEventListener("input", render)
fBox.addEventListener("change", render)

for (let i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function(e) {
        let t = e.target
        if (t.tagName !== "BUTTON") return
        for (let j = 0; j < btns.length; j++) {
            btns[j].classList.remove("active")
        }
        t.classList.add("active")

        let c = t.getAttribute("data-cat")
        title.innerText = t.innerText
        f(c)
    })
}

grid.addEventListener("click", function(e) {
    let el = e.target.closest(".card")
    if (!el) return
    let idx = el.getAttribute("data-idx")
    let item = curData[idx]

    let n = item.name || item.full_name || item.displayName || "UNNAMED"
    let img = getImg(item)

    let h = "<div class='detail-grid'>"
    h += "<div><img src='" + img + "' style='width:100%; object-fit:contain; filter:drop-shadow(0 10px 15px rgba(0,0,0,0.5));' loading='lazy'></div>"
    h += "<div><h2 style='color:var(--neon-pink); font-family:var(--font-head); font-size:2.8rem; margin-bottom:15px; line-height: 1;'>" + n.toUpperCase() + "</h2>"

    if (item.full_name && item.full_name !== n) {
        h += "<p style='color:var(--text-dim); font-size:0.85rem; margin-bottom:10px; letter-spacing:1px;'>" + item.full_name + "</p>"
    }

    if (item.description) {
        h += "<p style='color:var(--text-dim); margin-bottom:15px; line-height: 1.5; font-size: 0.95rem;'>" + item.description + "</p>"
    }

    // Maps detail
    if (curCat === "maps") {
        h += "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px;'>"
        h += "<div class='detail-section' style='border:none; margin:0; padding:0;'><h3 style='color:var(--pure-white); margin-bottom:10px; font-family:var(--font-head);'>MAP INFO</h3>"
        if (item.game_mode) h += "<p style='color:var(--text-dim); margin-bottom:5px;'><strong style='color:var(--neon-pink);'>GAME MODE:</strong> <span style='color:var(--pure-white);'>" + item.game_mode + "</span></p>"
        if (item.location) h += "<p style='color:var(--text-dim); margin-bottom:5px;'><strong style='color:var(--neon-pink);'>LOCATION:</strong> <span style='color:var(--pure-white);'>" + item.location + "</span></p>"
        if (typeof item.is_competitive !== "undefined") h += "<p style='color:var(--text-dim); margin-bottom:5px;'><strong style='color:var(--neon-pink);'>COMPETITIVE:</strong> <span style='color:var(--pure-white);'>" + (item.is_competitive ? "YES" : "NO") + "</span></p>"
        if (item.sub_map_name) h += "<p style='color:var(--text-dim); margin-bottom:5px;'><strong style='color:var(--neon-pink);'>SUB MAP:</strong> <span style='color:var(--pure-white);'>" + item.sub_map_name + "</span></p>"
        h += "</div>"

        if (item.video) {
            h += "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;'>"
            h += "<a href='" + item.video + "' target='_blank' style='display:inline-block; padding:10px 22px; background:var(--neon-pink); color:#000; font-family:var(--font-head); font-size:0.9rem; text-decoration:none; letter-spacing:2px; border-radius:2px;'>▶ WATCH VIDEO</a>"
        }

        // Show all map images as a gallery strip
        if (item.images && item.images.length > 1) {
            h += "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;'>"
            h += "<h3 style='color:var(--pure-white); margin-bottom:10px; font-family:var(--font-head); font-size:1rem;'>MAP VIEWS</h3>"
            h += "<div style='display:flex; gap:8px; flex-wrap:wrap;'>"
            for (let j = 0; j < item.images.length; j++) {
                let mi = item.images[j]
                if (mi.startsWith("/")) mi = IMG_BASE + mi
                h += "<img src='" + mi + "' style='width:calc(50% - 4px); border-radius:4px; object-fit:cover; cursor:pointer;' loading='lazy' onclick=\"document.querySelector('.detail-grid img').src=this.src\">"
            }
            h += "</div>"
        }
    }

    // Heroes detail
    if (curCat === "heroes") {
        if (item.role) {
            h += "<hr style='border: none; border-top: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px;'>"
            h += "<p style='margin-bottom: 5px;'><strong style='color:var(--neon-pink); font-size: 1.1rem;'>ROLE: </strong> <span style='color:var(--pure-white); font-size: 1.1rem;'>" + item.role + "</span></p>"
        }
        if (item.difficulty) {
            h += "<p style='color:var(--text-dim); margin-bottom:5px;'><strong style='color:var(--neon-pink);'>DIFFICULTY:</strong> <span style='color:var(--pure-white);'>" + item.difficulty + "</span></p>"
        }
        if (item.real_name) {
            h += "<p style='color:var(--text-dim); margin-bottom:5px;'><strong style='color:var(--neon-pink);'>REAL NAME:</strong> <span style='color:var(--pure-white);'>" + item.real_name + "</span></p>"
        }
        if (item.team) {
            h += "<p style='color:var(--text-dim); margin-bottom:5px;'><strong style='color:var(--neon-pink);'>TEAM:</strong> <span style='color:var(--pure-white);'>" + item.team + "</span></p>"
        }
    }

    h += "</div></div>"
    modBody.innerHTML = h
    modOver.classList.add("active")
})

modClose.addEventListener("click", function() {
    modOver.classList.remove("active")
})

let auCtx;
function playSfx(type) {
    if (!auCtx) {
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        auCtx = new AudioContext();
    }
    if (auCtx.state === 'suspended') auCtx.resume();
    let osc = auCtx.createOscillator();
    let gain = auCtx.createGain();
    osc.connect(gain);
    gain.connect(auCtx.destination);

    let now = auCtx.currentTime;
    if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
}

document.addEventListener('mouseover', function(e) {
    let t = e.target.closest('.card, button, #search-box, #filter-box, .modal-close');
    if (!t) return;
    let r = e.relatedTarget;
    if (r && t.contains(r)) return;
    playSfx('hover');
});

document.addEventListener('mousedown', function(e) {
    let t = e.target.closest('.card, button, #search-box, #filter-box, .modal-close');
    if (!t) return;
    playSfx('click');
});

init()
