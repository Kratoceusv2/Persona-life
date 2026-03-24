const DB = {
    state: JSON.parse(localStorage.getItem('persona_v4_data')) || {
        stats: { intel: 10, charme: 10, maitrise: 10, courage: 10, gentil: 10 },
        tasks: [],
        contacts: [],
        events: {} // Format: { "2024-03-24": [{title: "...", contact: "..."}] }
    },

    save() {
        localStorage.setItem('persona_v4_data', JSON.stringify(this.state));
    },

    getLv(xp) {
        let lv = 1, req = 100, cur = xp;
        while(cur >= req && lv < 99) { cur -= req; lv++; req = 100 + (lv * 20); }
        return { lv, cur, req, per: (cur/req)*100 };
    }
};
