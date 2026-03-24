// --- NAVIGATION ---
function router(page) {
    const view = document.getElementById('page-content');
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    // Mark active button... (omitted for brevity)
    
    if (page === 'agenda') renderAgenda(view);
    if (page === 'calendar') renderCalendar(view);
    if (page === 'social') renderSocial(view);
    if (page === 'stats') renderStats(view);
}

// --- MODULE SOCIAL (Multi-contacts & Multi-groupes) ---
function renderSocial(container) {
    container.innerHTML = `
        <div class="section-title">SOCIAL LINKS</div>
        <button class="btn-red" onclick="showAddContact()">+ RECRUTER GROUPE</button>
        <div id="contact-list" style="margin-top:15px;"></div>
    `;
    const list = document.getElementById('contact-list');
    DB.state.contacts.forEach(c => {
        list.innerHTML += `
            <div class="item-row">
                <div>
                    <b>${c.name}</b><br>
                    <small style="color:var(--gold)">${c.groups.join(' / ')}</small>
                </div>
                <div style="font-family:var(--font-title); color:var(--gold)">RANK ${c.rank}</div>
            </div>
        `;
    });
}

function showAddContact() {
    const modal = document.getElementById('modal-container');
    document.getElementById('modal-body').innerHTML = `
        <h2 style="font-family:var(--font-title); color:white;">NOUVEAUX CONTACTS</h2>
        <input type="text" id="names" placeholder="Noms (ex: Ryuji, Ann, Morgana)">
        <input type="text" id="groups" placeholder="Groupes (ex: Lycée, Voleurs, Sport)">
        <button class="btn-red" style="background:black" onclick="saveContacts()">VALIDER</button>
    `;
    modal.style.display = 'flex';
}

function saveContacts() {
    const names = document.getElementById('names').value.split(',').map(n => n.trim()).filter(n => n);
    const groups = document.getElementById('groups').value.split(',').map(g => g.trim()).filter(g => g);
    names.forEach(n => {
        DB.state.contacts.push({ name: n, groups: groups.length ? groups : ["Solo"], rank: 1 });
    });
    DB.save();
    closeModal();
    router('social');
}

// --- MODULE STATS (RADAR 1-99) ---
function renderStats(container) {
    container.innerHTML = `<div class="section-title">PSYCHÉ PROFILE</div><div id="radar-container"><svg id="radar-svg" width="200" height="200"></svg></div><div id="stats-bars"></div>`;
    drawRadar();
    const bars = document.getElementById('stats-bars');
    Object.keys(DB.state.stats).forEach(k => {
        const info = DB.getLv(DB.state.stats[k]);
        bars.innerHTML += `
            <div style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; font-family:var(--font-title); font-size:18px;">
                    <span>${k.toUpperCase()}</span><span>NV.${info.lv}</span>
                </div>
                <div style="background:#222; height:8px;"><div style="width:${info.per}%; background:var(--red); height:100%;"></div></div>
                <div style="text-align:right; font-size:10px; color:#666;">SUIVANT: ${info.req - info.cur} XP</div>
            </div>
        `;
    });
}

function drawRadar() {
    const svg = document.getElementById('radar-svg');
    const points = Object.keys(DB.state.stats).map((k, i) => {
        const info = DB.getLv(DB.state.stats[k]);
        const angle = (i * 72 - 90) * Math.PI / 180;
        const radius = (info.lv / 99 * 70) + 20;
        return `${100 + radius * Math.cos(angle)},${100 + radius * Math.sin(angle)}`;
    });
    svg.innerHTML = `<path d="M ${points.join(' L ')} Z" fill="rgba(232,0,28,0.4)" stroke="var(--red)" stroke-width="2"/>`;
}

// --- CALENDRIER ---
function renderCalendar(container) {
    const now = new Date();
    container.innerHTML = `<div class="section-title">${now.toLocaleDateString('fr-FR', {month:'long', year:'numeric'}).toUpperCase()}</div><div class="cal-grid" id="cal-grid"></div>`;
    const grid = document.getElementById('cal-grid');
    const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
    for(let d=1; d<=daysInMonth; d++) {
        const dateObj = new Date(now.getFullYear(), now.getMonth(), d);
        const day = dateObj.getDay();
        const isSun = day === 0; const isSat = day === 6;
        grid.innerHTML += `<div class="cal-cell ${isSun?'sun':''} ${isSat?'sat':''} ${d===now.getDate()?'today':''}" onclick="alert('Jour ${d}')">${d}</div>`;
    }
}

// Helpers
function closeModal() { document.getElementById('modal-container').style.display = 'none'; }
window.onload = () => { 
    document.getElementById('header-date').textContent = new Date().toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit'});
    router('agenda'); 
};
