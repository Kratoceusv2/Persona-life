const DB = {
    data: JSON.parse(localStorage.getItem('plife_v5')) || {
        stats: { 
            intelligence: 0, 
            charme: 0, 
            courage: 0, 
            maitrise: 0, 
            empathie: 0 
        },
        tasks: [],
        contacts: [],
        events: []
    },

    save() {
        localStorage.setItem('plife_v5', JSON.stringify(this.data));
    },

    // Calcul du niveau (1 à 99). Plus on monte, plus il faut d'XP
    getStatLevel(xp) {
        let lv = 1;
        let req = 100;
        let currentXp = xp;

        while (currentXp >= req && lv < 99) {
            currentXp -= req;
            lv++;
            req = Math.floor(100 * Math.pow(1.1, lv)); // Le niveau suivant demande 10% d'XP en plus
        }
        
        return { 
            lv: lv, 
            current: currentXp, 
            required: req, 
            percent: (currentXp / req) * 100 
        };
    },

    addXp(statName, amount) {
        if(this.data.stats[statName] !== undefined) {
            this.data.stats[statName] += parseInt(amount);
            this.save();
        }
    }
};

