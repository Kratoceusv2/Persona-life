let currentDate = new Date();

window.onload = () => {
    document.getElementById('header-date').textContent = currentDate.toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit'});
    router('tasks');
};

function router(view) {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${view}`).classList.add('active');
    
    const content = document.getElementById('app-content');
    if(view === 'tasks') renderTasks(content);
    if(view === 'calendar') renderCalendar(content);
    if(view === 'social') renderSocial(content);
    if(view === 'stats') renderStats(content);
}

// ================= MISSIONS =================
function renderTasks(container) {
    let html = `<button class="btn-red" onclick="openTaskModal()">+ NOUVELLE MISSION</button>`;
    
    if(DB.data.tasks.length === 0) html += `<p style="text-align:center; color:#666;">Aucune mission en cours.</p>`;
    
    DB.data.tasks.forEach((t, index) => {
        html += `
        <div class="card">
            <div>
                <div class="card-title">${t.name}</div>
                <div style="color:#aaa; font-size:14px;">Récompense: +${t.xp} ${t.stat.toUpperCase()}</div>
            </div>
            <button style="background:var(--gold); border:none; padding:10px; font-weight:bold; cursor:pointer;" 
                onclick="completeTask(${index})">TERMINER</button>
        </div>`;
    });
    container.innerHTML = html;
}

function completeTask(index) {
    const task = DB.data.tasks[index];
    DB.addXp(task.stat, task.xp);
    DB.data.tasks.splice(index, 1);
    DB.save();
    router('tasks');
}

// ================= STATS & RADAR =================
function renderStats(container) {
    const statsKeys = Object.keys(DB.data.stats);
    let html = `<div id="radar-container"><svg id="radar-svg" width="220" height="220"></svg></div><div id="stats-list">`;
    
    statsKeys.forEach(stat => {
        const info = DB.getStatLevel(DB.data.stats[stat]);
        html += `
        <div style="margin-bottom: 15px;">
            <div class="stat-info">
                <span style="color:var(--gold)">${stat.toUpperCase()}</span>
                <span>RANG ${info.lv}</span>
            </div>
            <div class="stat-bar-bg">
                <div class="stat-bar-fill" style="width: ${info.percent}%"></div>
            </div>
            <div style="text-align:right; font-size:12px; color:#888;">${info.current} / ${info.required} XP</div>
        </div>`;
    });
    
    html += `</div>`;
    container.innerHTML = html;
    drawRadar(statsKeys);
}

function drawRadar(statsKeys) {
    const svg = document.getElementById('radar-svg');
    const centerX = 110, centerY = 110, maxRadius = 100;
    
    // Grille de fond (Pentagone)
    let gridHtml = '';
    for(let i=1; i<=5; i++) {
        const r = maxRadius * (i/5);
        let pts = statsKeys.map((_, index) => {
            const angle = (Math.PI * 2 * index / statsKeys.length) - (Math.PI / 2);
            return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
        }).join(' ');
        gridHtml += `<polygon points="${pts}" fill="none" stroke="#333" stroke-width="1"/>`;
    }

    // Graphique des stats
    let points = statsKeys.map((stat, index) => {
        const lvl = DB.getStatLevel(DB.data.stats[stat]).lv;
        const radius = maxRadius * (lvl / 99); // Échelle 1-99
        const angle = (Math.PI * 2 * index / statsKeys.length) - (Math.PI / 2);
        
        // Ajouter les textes
        gridHtml += `<text x="${centerX + (maxRadius+10) * Math.cos(angle)}" y="${centerY + (maxRadius+10) * Math.sin(angle)}" fill="#fff" font-size="10" text-anchor="middle" dominant-baseline="middle">${stat.substring(0,3).toUpperCase()}</text>`;
        
        return `${centerX + radius * Math.cos(angle)},${centerY + radius * Math.sin(angle)}`;
    }).join(' ');

    svg.innerHTML = gridHtml + `<polygon points="${points}" fill="rgba(232,0,28,0.5)" stroke="var(--red)" stroke-width="2"/>`;
}

// ================= CONTACTS =================
function renderSocial(container) {
    let html = `<button class="btn-red" onclick="openContactModal()">+ NOUVEAU CONTACT</button>`;
    
    // Grouper les contacts
    let groups = {};
    DB.data.contacts.forEach((c, i) => {
        if(!groups[c.group]) groups[c.group] = [];
        groups[c.group].push({...c, index: i});
    });

    for(let g in groups) {
        html += `<div style="font-family:var(--font-title); font-size:22px; color:var(--red); margin-top:15px; border-bottom:1px solid #333;">${g.toUpperCase()}</div>`;
        groups[g].forEach(c => {
            html += `
            <div class="card" onclick="openEditContactModal(${c.index})" style="cursor:pointer;">
                <div class="card-title">${c.name}</div>
                <div class="badge">Modifier ✏️</div>
            </div>`;
        });
    }
    container.innerHTML = html;
}

// ================= CALENDRIER =================
function renderCalendar(container) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
    
    let html = `
    <div class="cal-header">
        <button onclick="changeMonth(-1)" style="background:none; border:none; color:white; font-size:20px;">◀</button>
        <div>${monthNames[month]} ${year}</div>
        <button onclick="changeMonth(1)" style="background:none; border:none; color:white; font-size:20px;">▶</button>
    </div>
    <div class="cal-grid">
        <div class="cal-day-name">LUN</div><div class="cal-day-name">MAR</div><div class="cal-day-name">MER</div>
        <div class="cal-day-name">JEU</div><div class="cal-day-name">VEN</div><div class="cal-day-name sat">SAM</div><div class="cal-day-name sun">DIM</div>
    `;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Ajuster pour commencer le Lundi

    for (let i = 0; i < offset; i++) html += `<div></div>`; // Cases vides

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const dayOfWeek = new Date(year, month, d).getDay();
        
        let classes = "cal-cell";
        if (dayOfWeek === 0) classes += " sun";
        if (dayOfWeek === 6) classes += " sat";
        if (d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) classes += " today";
        
        const hasEvent = DB.data.events.some(e => e.date === dateStr) ? "has-event" : "";

        html += `<div class="${classes} ${hasEvent}" onclick="openEventModal('${dateStr}')">${d}</div>`;
    }
    
    html += `</div><div id="event-list" style="margin-top:20px;"></div>`;
    container.innerHTML = html;
    showEventsForMonth(month, year);
}

function changeMonth(dir) {
    currentDate.setMonth(currentDate.getMonth() + dir);
    router('calendar');
}

function showEventsForMonth(month, year) {
    const list = document.getElementById('event-list');
    let eventsHtml = '';
    DB.data.events.forEach(e => {
        const eDate = new Date(e.date);
        if(eDate.getMonth() === month && eDate.getFullYear() === year) {
            eventsHtml += `<div class="card"><span style="color:var(--red); font-weight:bold;">${eDate.getDate()} :</span> ${e.title}</div>`;
        }
    });
    list.innerHTML = eventsHtml || "<p style='color:#666'>Aucun événement ce mois-ci.</p>";
}

// ================= MODALS (POP-UPS) =================
function showModal(contentHtml) {
    document.getElementById('modal-body').innerHTML = contentHtml;
    document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// Modal Mission
function openTaskModal() {
    let opts = Object.keys(DB.data.stats).map(k => `<option value="${k}">${k.toUpperCase()}</option>`).join('');
    showModal(`
        <h2 style="font-family:var(--font-title); margin-bottom:15px;">NOUVELLE MISSION</h2>
        <input type="text" id="t-name" placeholder="Nom de la tâche">
        <select id="t-stat">${opts}</select>
        <input type="number" id="t-xp" placeholder="XP gagnée (ex: 50)">
        <button class="btn-red" onclick="saveTask()">AJOUTER</button>
    `);
}
function saveTask() {
    DB.data.tasks.push({
        name: document.getElementById('t-name').value,
        stat: document.getElementById('t-stat').value,
        xp: parseInt(document.getElementById('t-xp').value) || 10
    });
    DB.save(); closeModal(); router('tasks');
}

// Modal Contact
function openContactModal() {
    showModal(`
        <h2 style="font-family:var(--font-title); margin-bottom:15px;">NOUVEAU CONTACT</h2>
        <input type="text" id="c-name" placeholder="Nom (ex: Ryuji)">
        <input type="text" id="c-group" placeholder="Groupe (ex: Lycée, Voleurs)">
        <button class="btn-red" onclick="saveContact()">RECRUTER</button>
    `);
}
function saveContact() {
    DB.data.contacts.push({
        name: document.getElementById('c-name').value || "Inconnu",
        group: document.getElementById('c-group').value || "Divers"
    });
    DB.save(); closeModal(); router('social');
}

// Edit Contact
function openEditContactModal(index) {
    const c = DB.data.contacts[index];
    showModal(`
        <h2 style="font-family:var(--font-title); margin-bottom:15px;">MODIFIER CONTACT</h2>
        <input type="text" id="ce-name" value="${c.name}">
        <input type="text" id="ce-group" value="${c.group}">
        <button class="btn-red" onclick="updateContact(${index})">SAUVEGARDER</button>
        <button style="background:none; border:1px solid #666; color:#aaa; width:100%; padding:10px; margin-top:10px;" onclick="deleteContact(${index})">SUPPRIMER</button>
    `);
}
function updateContact(index) {
    DB.data.contacts[index].name = document.getElementById('ce-name').value;
    DB.data.contacts[index].group = document.getElementById('ce-group').value;
    DB.save(); closeModal(); router('social');
}
function deleteContact(index) {
    DB.data.contacts.splice(index, 1);
    DB.save(); closeModal(); router('social');
}

// Modal Event
function openEventModal(dateStr) {
    showModal(`
        <h2 style="font-family:var(--font-title); margin-bottom:15px;">ÉVÉNEMENT DU ${dateStr}</h2>
        <input type="text" id="e-title" placeholder="Titre de l'événement">
        <button class="btn-red" onclick="saveEvent('${dateStr}')">MARQUER LE CALENDRIER</button>
    `);
}
function saveEvent(dateStr) {
    const title = document.getElementById('e-title').value;
    if(title) {
        DB.data.events.push({ date: dateStr, title: title });
        DB.save();
    }
    closeModal(); router('calendar');
}

