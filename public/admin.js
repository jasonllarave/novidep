const loginSection = document.getElementById("login-section");
const panelSection = document.getElementById("panel-section");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const api = "/api/admin";

loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${api}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.success) {
    loginSection.style.display = "none";
    panelSection.style.display = "block";
    loadLinks();
    loadStats();
  } else {
    loginError.style.display = "block";
  }
});

async function loadLinks() {
  const res = await fetch(`${api}/links`);
  const links = await res.json();
  const container = document.getElementById("links-list");
  container.innerHTML = "";
  links.forEach(l => {
    const div = document.createElement("div");
    div.innerHTML = `${l.title} - <a href="${l.url}" target="_blank">${l.url}</a>
      <button onclick="deleteLink('${l.title}')">Eliminar</button>`;
    container.appendChild(div);
  });
}

async function deleteLink(title) {
  await fetch(`${api}/links/${title}`, { method: "DELETE" });
  loadLinks();
}

document.getElementById("add-link").addEventListener("click", async () => {
  const title = document.getElementById("new-title").value;
  const url = document.getElementById("new-url").value;
  await fetch(`${api}/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, url })
  });
  loadLinks();
});

document.getElementById("run-crawler").addEventListener("click", async () => {
  await fetch(`${api}/crawl`, { method: "POST" });
  loadLinks();
});

async function loadStats() {
  const res = await fetch('/api/chatbot/stats');
  const data = await res.json();
  
  document.getElementById("metrics").innerHTML = `
    <p><strong>Total de mensajes:</strong> ${data.totalMessages || 0}</p>
    <p><strong>Total de sesiones:</strong> ${data.totalSessions || 0}</p>
    <p><strong>Promedio de longitud:</strong> ${data.avgResponseLength || 0}</p>
  `;

  // Gráfico
  const ctx = document.getElementById('topicsChart').getContext('2d');
  if (window.chartInstance) window.chartInstance.destroy();
  
  const topics = data.topTopics || [];
  window.chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topics.map(t => t._id || 'Sin clasificar'),
      datasets: [{
        label: 'Consultas',
        data: topics.map(t => t.count),
        backgroundColor: '#0b63c7'
      }]
    }
  });

async function loadStats() {
  const res = await fetch('http://localhost:3000/api/chatbot/stats');
  const data = await res.json();
  
  document.getElementById("metrics").innerHTML = `
    <p><strong>Total de mensajes:</strong> ${data.totalMessages || 0}</p>
    <p><strong>Total de sesiones:</strong> ${data.totalSessions || 0}</p>
    <p><strong>Promedio de longitud:</strong> ${data.avgResponseLength || 0}</p>
  `;

  // Gráfico
  const ctx = document.getElementById('topicsChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();
  
  const topics = data.topTopics || [];
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topics.map(t => t._id || 'Sin clasificar'),
      datasets: [{
        label: 'Consultas',
        data: topics.map(t => t.count),
        backgroundColor: '#0b63c7'
      }]
    }
  });
}

document.getElementById("view-history-btn").addEventListener("click", async () => {
  const container = document.getElementById("history-container");
  if (container.style.display === "block") {
    container.style.display = "none";
    return;
  }
  
  const res = await fetch('/api/chatbot/history');
  const { history } = await res.json();
  
  container.innerHTML = history.map(m => `
    <div style="background:#f9f9f9; padding:10px; margin:5px 0; border-radius:5px;">
      <strong>Usuario:</strong> ${m.userMessage}<br>
      <strong>Bot:</strong> ${m.botResponse}<br>
      <small>${new Date(m.timestamp).toLocaleString()}</small>
    </div>
  `).join('');
  
  container.style.display = "block";
});
}


