//pls do not look at api key or url :3
const SUPABASE_URL = "https://qphedhcqifwnoluyjych.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwaGVkaGNxaWZ3bm9sdXlqeWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMTI2OTgsImV4cCI6MjA5NDg4ODY5OH0.Dpm7BafLOQ_3x156jkgTvjSUvre897maZOQwJG6E_2k";

const input = document.querySelector(".search");
const display = document.querySelector(".displayfield");
const overlay = document.querySelector(".overlay");
const requestModal = document.getElementById("requestModal");
const requestClose = document.getElementById("requestClose");
const reqSubmit = document.getElementById("req-submit");
const reqFeedback = document.getElementById("req-feedback");

async function search(query) {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/games?roblox_name=ilike.*${encodeURIComponent(query)}*&select=*`,
        {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`
            }
        }
    );
    const data = await res.json();
    render(data);
}

function render(games) {
    if (!games.length) {
        display.innerHTML = `<p class="no-results">No results found - You can request adding a game</p>`;
        return;
    }

    display.innerHTML = games.map(g => `
        <div class="card is-${g.status}" data-id="${g.id}">
            <div class="card-left">
                ${g.roblox_thumbnail ? `<img class="card-thumb" src="${g.roblox_thumbnail}" alt="">` : '<div class="card-thumb-placeholder"></div>'}
                <div class="card-name">${g.roblox_name}</div>
            </div>
            <div class="card-badge">${
                g.status === 'copy' ? 'Copy!' :
                g.status === 'inspired' ? 'Heavily Inspired!' :
                'Not a copy!'
            }</div>
        </div>
    `).join("");

    document.querySelectorAll(".card.is-copy, .card.is-inspired").forEach(card => {
        card.addEventListener("click", () => {
            const game = games.find(g => g.id == card.dataset.id);
            openOverlay(game);
        });
    });
}

async function openOverlay(game) {
    document.querySelector(".overlay-roblox-name").textContent = game.roblox_name;
    document.querySelector(".overlay-original-name").textContent = game.original_name;
    document.querySelector(".overlay-notes").textContent = game.notes || "";
    document.querySelector(".overlay-roblox-thumb").src = game.roblox_thumbnail || "";
    document.querySelector(".overlay-original-thumb").src = game.original_thumbnail || "";

    const copyOfEl = document.querySelector(".copy-of");
    if (game.status === 'inspired') {
        copyOfEl.innerHTML = `➜<br>Heavily<br>Inspired<br>➜`;
        copyOfEl.style.color = '#c8a84b';
    } else {
        copyOfEl.innerHTML = `➜<br>Copy of<br>➜`;
        copyOfEl.style.color = '#c0504d';
    }

    overlay.classList.add("active");
    document.body.classList.add("blurred");
}

document.getElementById("overlayClose").addEventListener("click", () => {
    overlay.classList.remove("active");
    document.body.classList.remove("blurred");
});

overlay.addEventListener("click", e => {
    if (e.target === overlay) {
        overlay.classList.remove("active");
        document.body.classList.remove("blurred");
    }
});

let debounceTimer;
input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const query = input.value.trim();
    if (!query) { display.innerHTML = ""; return; }
    debounceTimer = setTimeout(() => search(query), 300);
});

let captchaAnswer = 0;

function generateCaptcha() {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    captchaAnswer = a + b;
    document.getElementById("captcha-question").textContent = `What is ${a} + ${b}?`;
    document.getElementById("req-captcha").value = "";
}

document.querySelector(".requestAdd").addEventListener("click", () => {
    requestModal.classList.add("active");
    document.body.classList.add("blurred");
    generateCaptcha();
});

requestClose.addEventListener("click", () => {
    requestModal.classList.remove("active");
    document.body.classList.remove("blurred");
});

requestModal.addEventListener("click", e => {
    if (e.target === requestModal) {
        requestModal.classList.remove("active");
        document.body.classList.remove("blurred");
    }
});

reqSubmit.addEventListener("click", async () => {
    const roblox_name = document.getElementById("req-roblox").value.trim();
    const original_name = document.getElementById("req-original").value.trim();
    const status = document.getElementById("req-status").value;
    const notes = document.getElementById("req-notes").value.trim();
    const honey = document.getElementById("req-honey").value;
    const captcha = parseInt(document.getElementById("req-captcha").value.trim());

    if (honey) return;

    if (!roblox_name) {
        reqFeedback.textContent = "Please enter a Roblox game name.";
        reqFeedback.className = "request-feedback error";
        return;
    }

    if (captcha !== captchaAnswer) {
        reqFeedback.textContent = "Wrong answer, try again.";
        reqFeedback.className = "request-feedback error";
        generateCaptcha();
        return;
    }

    reqSubmit.textContent = "Submitting...";
    reqSubmit.disabled = true;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/requests`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({ roblox_name, original_name, status, notes })
    });

    if (res.ok) {
        reqFeedback.textContent = "Submitted! We'll review it soon.";
        reqFeedback.className = "request-feedback success";
        document.getElementById("req-roblox").value = "";
        document.getElementById("req-original").value = "";
        document.getElementById("req-notes").value = "";
        generateCaptcha();
    } else {
        reqFeedback.textContent = "Something went wrong, try again.";
        reqFeedback.className = "request-feedback error";
    }

    reqSubmit.textContent = "Submit";
    reqSubmit.disabled = false;
});

async function loadCount() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/games?select=id`, {
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
        }
    });
    const data = await res.json();
    document.getElementById("gameCount").textContent = data.length;
}

loadCount();