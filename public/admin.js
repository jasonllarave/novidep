// ===============================
//   PANEL ADMIN - NOVI
// ===============================

const API = "/api/admin";
const REG_API = "/api/registration";

// -------------------------------
// LOGIN
// -------------------------------
document.getElementById("login-btn").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("panel-section").style.display = "block";
        loadLinks();
        loadStats();
        loadRegistrations();
    } else {
        document.getElementById("login-error").style.display = "block";
    }
});

// -------------------------------
//  ENLACES (LINKS)
// -------------------------------
async function loadLinks() {
    const container = document.getElementById("links-list");
    container.innerHTML = "Cargando...";

    const res = await fetch(`${API}/links`);
    const links = await res.json();

    container.innerHTML = "";

    links.forEach(link => {
        const div = document.createElement("div");
        div.classList.add("link-item");
        div.innerHTML = `
            <strong>${link.title}</strong> - <a href="${link.url}" target="_blank">${link.url}</a>
            <button data-title="${link.title}" class="btn-delete-link">Eliminar</button>
        `;
        container.appendChild(div);
    });

    document.querySelectorAll(".btn-delete-link").forEach(btn => {
        btn.addEventListener("click", async () => {
            const title = btn.getAttribute("data-title");
            await fetch(`${API}/links/${title}`, { method: "DELETE" });
            loadLinks();
        });
    });
}

document.getElementById("add-link").addEventListener("click", async () => {
    const title = document.getElementById("new-title").value.trim();
    const url = document.getElementById("new-url").value.trim();

    if (!title || !url) return alert("Faltan datos");

    await fetch(`${API}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url })
    });

    document.getElementById("new-title").value = "";
    document.getElementById("new-url").value = "";

    loadLinks();
});

// Ejecutar crawler
document.getElementById("run-crawler").addEventListener("click", async () => {
    await fetch(`${API}/crawl`, { method: "POST" });
    alert("Crawler ejecutado");
});

// -------------------------------
//   MÉTRICAS
// -------------------------------
async function loadStats() {
    const res = await fetch(`${API}/stats`);
    const data = await res.json();

    document.getElementById("metrics").innerHTML = `
        <p><strong>Total mensajes:</strong> ${data.total}</p>
    `;

    // grafico
    const ctx = document.getElementById("topicsChart").getContext("2d");

    if (window.topicsChart) window.topicsChart.destroy();

    window.topicsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: data.topTemas.map(t => t._id || "Sin tema"),
            datasets: [{
                label: "Mensajes por tema",
                data: data.topTemas.map(t => t.total)
            }]
        }
    });
}

// -------------------------------
//   HISTORIAL DE MENSAJES
// -------------------------------
document.getElementById("view-history-btn").addEventListener("click", async () => {
    const cont = document.getElementById("history-container");

    if (cont.style.display === "block") {
        cont.style.display = "none";
        return;
    }

    cont.innerHTML = "Cargando...";
    cont.style.display = "block";

    const res = await fetch(`${API}/history`);
    const msgs = await res.json();

    cont.innerHTML = msgs.map(m => `
        <div style="border-bottom:1px solid #ccc; padding:6px;">
            <strong>${m.user}</strong>: ${m.text}
            <br><small>${new Date(m.createdAt).toLocaleString()}</small>
        </div>
    `).join("");
});

// -------------------------------
//   REGISTROS DE PARTICIPACIÓN
// -------------------------------
async function loadRegistrations() {
    const res = await fetch(`${REG_API}/list`);
    const data = await res.json();

    document.getElementById("reg-count").innerText = data.length;

    const table = document.querySelector("#reg-table tbody");
    table.innerHTML = "";

    data.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.name}</td>
            <td>${r.phone}</td>
            <td>${r.authorized ? "Sí" : "No"}</td>
            <td>${new Date(r.createdAt).toLocaleString()}</td>
        `;
        table.appendChild(tr);
    });
}

document.getElementById("refresh-regs").addEventListener("click", loadRegistrations);
