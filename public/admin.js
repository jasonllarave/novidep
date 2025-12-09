// public/admin.js - PANEL ADMINISTRATIVO COMPLETO

const API = "/api/admin";
let charts = {};
let currentPage = 1;
let currentRegPage = 1;

// ===============================
//   MANEJO DE TABS
// ===============================

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Remover active de todos
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Agregar active al clickeado
    tab.classList.add('active');
    const tabId = tab.getAttribute('data-tab');
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    // Cargar datos según el tab
    switch(tabId) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'metricas':
        loadMetrics();
        break;
      case 'historial':
        loadHistory();
        break;
      case 'registros':
        loadRegistrations();
        break;
      case 'links':
        loadLinks();
        break;
    }
  });
});

// ===============================
//   LOGIN
// ===============================

document.getElementById("login-btn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
      document.getElementById("login-section").style.display = "none";
      document.getElementById("panel-section").style.display = "block";
      loadDashboard();
    } else {
      document.getElementById("login-error").style.display = "block";
    }
  } catch (err) {
    console.error("Error en login:", err);
    alert("Error al conectar con el servidor");
  }
});

// ===============================
//   DASHBOARD
// ===============================

async function loadDashboard() {
  try {
    const res = await fetch(`${API}/dashboard`);
    const data = await res.json();

    // Stats cards
    const statsHTML = `
      <div class="stat-card">
        <h3>Total Registros</h3>
        <div class="number">${data.resumen.totalRegistros}</div>
      </div>
      <div class="stat-card">
        <h3>Autorizados</h3>
        <div class="number">${data.resumen.autorizados}</div>
      </div>
      <div class="stat-card">
        <h3>Conversaciones</h3>
        <div class="number">${data.resumen.totalConversaciones}</div>
      </div>
      <div class="stat-card">
        <h3>Activas</h3>
        <div class="number">${data.resumen.conversacionesActivas}</div>
      </div>
    `;
    document.getElementById('dashboard-stats').innerHTML = statsHTML;

    // Últimos registros
    const regHTML = data.ultimosRegistros.map(r => `
      <div style="padding: 10px; background: #f8f9fa; border-radius: 8px; margin: 5px 0;">
        <strong>${r.nombre || 'N/A'}</strong> - ${r.telefono || 'N/A'}<br>
        <small>${r.autorizado ? '🟢 Autorizado' : '🕑 Pendiente'} - ${new Date(r.fecha).toLocaleString('es-CO')}</small>
      </div>
    `).join('');
    document.getElementById('ultimos-registros').innerHTML = regHTML || '<p>No hay registros recientes</p>';

    // Conversaciones recientes
    const convHTML = data.conversacionesRecientes.map(c => `
      <div style="padding: 10px; background: #f8f9fa; border-radius: 8px; margin: 5px 0;">
        <strong>${c.userId}</strong> - ${c.mensajes} mensajes<br>
        <small>Estado: ${c.estado} - ${new Date(c.ultimaActividad).toLocaleString('es-CO')}</small>
      </div>
    `).join('');
    document.getElementById('conversaciones-recientes').innerHTML = convHTML || '<p>No hay conversaciones recientes</p>';

  } catch (err) {
    console.error("Error cargando dashboard:", err);
  }
}

// ===============================
//   MÉTRICAS
// ===============================

async function loadMetrics() {
  try {
    const res = await fetch(`${API}/stats`);
    const data = await res.json();

    // Stats cards
    const statsHTML = `
      <div class="stat-card">
        <h3>Total Conversaciones</h3>
        <div class="number">${data.totalConversaciones}</div>
      </div>
      <div class="stat-card">
        <h3>Registros</h3>
        <div class="number">${data.totalRegistros}</div>
      </div>
      <div class="stat-card">
        <h3>Autorizados</h3>
        <div class="number">${data.registrosAutorizados}</div>
      </div>
      <div class="stat-card">
        <h3>Promedio Mensajes</h3>
        <div class="number">${Math.round(data.promedioMensajes)}</div>
      </div>
    `;
    document.getElementById('metricas-stats').innerHTML = statsHTML;

    // Gráfico de conversaciones por día
    if (charts.conversations) charts.conversations.destroy();
    const convCtx = document.getElementById('conversationsChart').getContext('2d');
    charts.conversations = new Chart(convCtx, {
      type: 'line',
      data: {
        labels: data.conversacionesPorDia.map(d => d._id),
        datasets: [{
          label: 'Conversaciones',
          data: data.conversacionesPorDia.map(d => d.count),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    });

    // Gráfico de registros por día
    if (charts.registrations) charts.registrations.destroy();
    const regCtx = document.getElementById('registrationsChart').getContext('2d');
    charts.registrations = new Chart(regCtx, {
      type: 'bar',
      data: {
        labels: data.registrosPorDia.map(d => d._id),
        datasets: [{
          label: 'Registros',
          data: data.registrosPorDia.map(d => d.count),
          backgroundColor: '#27ae60'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    });

    // Gráfico de estados
    if (charts.status) charts.status.destroy();
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    charts.status = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: data.statusDistribution.map(s => s._id),
        datasets: [{
          data: data.statusDistribution.map(s => s.count),
          backgroundColor: ['#27ae60', '#f39c12', '#e74c3c', '#3498db']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

  } catch (err) {
    console.error("Error cargando métricas:", err);
  }
}

// ===============================
//   HISTORIAL DE CONVERSACIONES
// ===============================

async function loadHistory(page = 1) {
  try {
    currentPage = page;
    document.getElementById('history-container').innerHTML = '<p class="loading">Cargando...</p>';
    
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const res = await fetch(`${API}/history?limit=${limit}&skip=${skip}`);
    const data = await res.json();

    if (!data.conversations || data.conversations.length === 0) {
      document.getElementById('history-container').innerHTML = '<p>No hay conversaciones disponibles</p>';
      return;
    }

    const html = data.conversations.map(conv => `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>🔵 ${conv.userId}</strong><br>
            <small>Session: ${conv.sessionId}</small><br>
            <small>📨 ${conv.messageCount} mensajes | Estado: ${conv.status}</small><br>
            <small>📂 ${new Date(conv.lastActivity).toLocaleString('es-CO')}</small>
          </div>
          <button class="btn btn-primary" onclick="viewConversation('${conv.sessionId}')">
            📬 Ver Detalle
          </button>
        </div>
      </div>
    `).join('');

    document.getElementById('history-container').innerHTML = html;

    // Paginación
    const totalPages = data.totalPages;
    let paginationHTML = '';
    
    if (page > 1) {
      paginationHTML += `<button onclick="loadHistory(${page - 1})">« Anterior</button>`;
    }
    
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      paginationHTML += `<button class="${i === page ? 'active' : ''}" onclick="loadHistory(${i})">${i}</button>`;
    }
    
    if (page < totalPages) {
      paginationHTML += `<button onclick="loadHistory(${page + 1})">Siguiente »</button>`;
    }

    document.getElementById('history-pagination').innerHTML = paginationHTML;

  } catch (err) {
    console.error("Error cargando historial:", err);
    document.getElementById('history-container').innerHTML = '<p>Error cargando historial</p>';
  }
}

async function searchSession() {
  const sessionId = document.getElementById('search-session').value.trim();
  if (!sessionId) {
    loadHistory();
    return;
  }

  try {
    const res = await fetch(`${API}/history?sessionId=${sessionId}`);
    const data = await res.json();

    if (!data.conversations || data.conversations.length === 0) {
      document.getElementById('history-container').innerHTML = '<p>No se encontró la conversación</p>';
      return;
    }

    const conv = data.conversations[0];
    const html = `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <h3>Conversación Encontrada</h3>
        <p><strong>Usuario:</strong> ${conv.userId}</p>
        <p><strong>Session ID:</strong> ${conv.sessionId}</p>
        <p><strong>Mensajes:</strong> ${conv.messageCount}</p>
        <p><strong>Estado:</strong> ${conv.status}</p>
        <button class="btn btn-primary" onclick="viewConversation('${conv.sessionId}')">
          Ver Detalle Completo
        </button>
      </div>
    `;
    document.getElementById('history-container').innerHTML = html;
  } catch (err) {
    console.error("Error buscando sesión:", err);
  }
}

async function viewConversation(sessionId) {
  try {
    const res = await fetch(`${API}/conversation/${sessionId}`);
    const data = await res.json();

    const conv = data.conversation;
    const reg = data.registration;

    let html = `
      <div style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
        <h3>Información de la Sesión</h3>
        <p><strong>Session ID:</strong> ${conv.sessionId}</p>
        <p><strong>Usuario:</strong> ${conv.userId}</p>
        <p><strong>Estado:</strong> ${conv.status}</p>
        <p><strong>Inicio:</strong> ${new Date(conv.startTime).toLocaleString('es-CO')}</p>
        <p><strong>Última Actividad:</strong> ${new Date(conv.lastActivity).toLocaleString('es-CO')}</p>
        <p><strong>Total Mensajes:</strong> ${conv.messages.length}</p>
      </div>
    `;

    if (reg) {
      html += `
        <div style="margin-bottom: 20px; padding: 15px; background: #f1f8e9; border-radius: 8px;">
          <h3>Datos del Usuario</h3>
          <p><strong>Nombre:</strong> ${reg.name || 'N/A'}</p>
          <p><strong>Teléfono:</strong> ${reg.phone || 'N/A'}</p>
          <p><strong>Autorizado:</strong> ${reg.authorized ? '🟢 Sí' : '🔴 No'}</p>
          <p><strong>Paso Actual:</strong> ${reg.step}</p>
        </div>
      `;
    }

    html += '<div style="max-height: 400px; overflow-y: auto;"><h3>Historial de Mensajes</h3>';
    
    conv.messages.forEach(msg => {
      const isUser = msg.role === 'user';
      html += `
        <div class="message-item ${isUser ? 'message-user' : 'message-bot'}">
          <strong>${isUser ? '👤 Usuario' : '🧿 Novi'}:</strong><br>
          ${msg.content}<br>
          <small style="opacity: 0.7;">${new Date(msg.timestamp).toLocaleString('es-CO')}</small>
        </div>
      `;
    });

    html += '</div>';

    document.getElementById('modal-conversation-content').innerHTML = html;
    document.getElementById('conversation-modal').style.display = 'block';

  } catch (err) {
    console.error("Error cargando conversación:", err);
    alert("Error al cargar la conversación");
  }
}

function closeModal() {
  document.getElementById('conversation-modal').style.display = 'none';
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
  const modal = document.getElementById('conversation-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}

// ===============================
//   REGISTROS
// ===============================

async function loadRegistrations(page = 1) {
  try {
    currentRegPage = page;
    const limit = 20;
    const skip = (page - 1) * limit;

    const res = await fetch(`${API}/registros?limit=${limit}&skip=${skip}`);
    const data = await res.json();

    document.getElementById('reg-count').innerText = data.total;

    const tbody = document.querySelector("#reg-table tbody");
    tbody.innerHTML = "";

    if (!data.registros || data.registros.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay registros</td></tr>';
      return;
    }

    data.registros.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.name || 'N/A'}</td>
        <td>${r.phone || 'N/A'}</td>
        <td>${r.authorized ? '🟢Sí' : '🔴 No'}</td>
        <td>${r.step || 'N/A'}</td>
        <td>${new Date(r.createdAt).toLocaleString('es-CO')}</td>
      `;
      tbody.appendChild(tr);
    });

    // Paginación
    const totalPages = data.totalPages;
    let paginationHTML = '';
    
    if (page > 1) {
      paginationHTML += `<button onclick="loadRegistrations(${page - 1})">« Anterior</button>`;
    }
    
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      paginationHTML += `<button class="${i === page ? 'active' : ''}" onclick="loadRegistrations(${i})">${i}</button>`;
    }
    
    if (page < totalPages) {
      paginationHTML += `<button onclick="loadRegistrations(${page + 1})">Siguiente »</button>`;
    }

    document.getElementById('reg-pagination').innerHTML = paginationHTML;

  } catch (err) {
    console.error("Error cargando registros:", err);
  }
}

// ===============================
//   ENLACES (LINKS)
// ===============================

async function loadLinks() {
  try {
    const container = document.getElementById("links-list");
    container.innerHTML = "<p class='loading'>Cargando...</p>";

    const res = await fetch(`${API}/links`);
    const links = await res.json();

    if (!links || links.length === 0) {
      container.innerHTML = "<p>No hay enlaces disponibles</p>";
      return;
    }

    container.innerHTML = "";

    links.forEach(link => {
      const div = document.createElement("div");
      div.classList.add("link-item");
      div.innerHTML = `
        <div>
          <strong>${link.title}</strong><br>
          <a href="${link.url}" target="_blank">${link.url}</a>
        </div>
        <button class="btn btn-danger" onclick="deleteLink('${link.title}')">🗑️ Eliminar</button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error cargando links:", err);
  }
}

async function deleteLink(title) {
  if (!confirm(`¿Eliminar el enlace "${title}"?`)) return;

  try {
    await fetch(`${API}/links/${encodeURIComponent(title)}`, { method: "DELETE" });
    loadLinks();
  } catch (err) {
    console.error("Error eliminando link:", err);
  }
}

document.getElementById("add-link").addEventListener("click", async () => {
  const title = document.getElementById("new-title").value.trim();
  const url = document.getElementById("new-url").value.trim();

  if (!title || !url) {
    alert("Faltan datos");
    return;
  }

  try {
    await fetch(`${API}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url })
    });

    document.getElementById("new-title").value = "";
    document.getElementById("new-url").value = "";

    loadLinks();
  } catch (err) {
    console.error("Error agregando link:", err);
  }
});

// Ejecutar crawler
document.getElementById("run-crawler").addEventListener("click", async () => {
  if (!confirm("¿Ejecutar el crawler? Esto puede tomar unos minutos.")) return;

  try {
    await fetch(`${API}/crawl`, { method: "POST" });
    alert("Crawler ejecutado. Los resultados se actualizarán en unos minutos.");
  } catch (err) {
    console.error("Error ejecutando crawler:", err);
  }
});

// ===============================
//   PERMITIR ENTER EN LOGIN
// ===============================

document.getElementById("password").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("login-btn").click();
  }
});