import { categoryNames, evaluationSchema } from './config.js';
import { storage } from './storage.js';
import { playerManager } from './playerManager.js';

const { createApp } = Vue; // Vue est chargé via le CDN dans index.html

createApp({
    data() {
        return {
            currentView: 'list', // list, playerForm, playerDetail, evaluate
            players: [],
            evaluations: [],
            
            // Filtres
            filters: { search: '', category: '' },
            
            // Objets en cours
            formPlayer: playerManager.createEmpty(),
            currentPlayer: null,
            currentEval: null,
            
            // Config importée
            schema: evaluationSchema,
            catNames: categoryNames,
            chartInstance: null
        };
    },
    computed: {
        filteredPlayers() {
            return this.players.filter(p => {
                const matchName = (p.firstName + ' ' + p.lastName).toLowerCase().includes(this.filters.search.toLowerCase());
                const matchCat = this.filters.category ? p.category === this.filters.category : true;
                return matchName && matchCat;
            });
        },
        playerEvaluations() {
            if (!this.currentPlayer) return [];
            return this.evaluations
                .filter(e => e.playerId === this.currentPlayer.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        },
        liveScore() {
            if (!this.currentEval) return 0;
            let total = 0, count = 0;
            for (const cat in this.currentEval.ratings) {
                for (const key in this.currentEval.ratings[cat]) {
                    total += this.currentEval.ratings[cat][key];
                    count++;
                }
            }
            return count === 0 ? 0 : (total / count).toFixed(1);
        }
    },
    mounted() {
        // Chargement initial des données
        this.players = storage.getPlayers();
        this.evaluations = storage.getEvaluations();
    },
    methods: {
        changeView(view) {
            this.currentView = view;
        },
        getScoreColor: playerManager.getScoreColor,
        
        // --- GESTION JOUEUR ---
        prepareNewPlayer() {
            this.formPlayer = playerManager.createEmpty();
            this.currentView = 'playerForm';
        },
        savePlayerForm() {
            if (!this.formPlayer.id) {
                this.formPlayer.id = crypto.randomUUID();
                this.players.push({...this.formPlayer});
            } else {
                // Logique de modification (non implémentée ici pour simplifier, on ajoute juste)
            }
            storage.savePlayers(this.players);
            this.currentView = 'list';
        },
        selectPlayer(player) {
            this.currentPlayer = player;
            this.currentView = 'playerDetail';
            setTimeout(() => this.renderChart(), 100);
        },

        // --- GESTION EVALUATION ---
        startEvaluation() {
            this.currentEval = {
                id: crypto.randomUUID(),
                playerId: this.currentPlayer.id,
                date: new Date().toLocaleDateString('fr-FR'),
                ratings: {}
            };
            // Initialisation des notes à 5
            for (const cat in this.schema) {
                this.currentEval.ratings[cat] = {};
                this.schema[cat].forEach(c => this.currentEval.ratings[cat][c.key] = 5);
            }
            this.currentView = 'evaluate';
        },
        submitEval() {
            this.currentEval.overallScore = this.liveScore;
            
            // Calculer moyennes pour le chart (simplifié)
            const avgs = {};
            for(const cat in this.currentEval.ratings) {
                let sum = 0, c = 0;
                Object.values(this.currentEval.ratings[cat]).forEach(v => { sum += v; c++; });
                avgs[cat] = sum/c;
            }
            this.currentEval.averages = avgs;

            // Sauvegarde
            this.evaluations.push({...this.currentEval});
            storage.saveEvaluations(this.evaluations);

            // Mise à jour badge joueur
            const pIdx = this.players.findIndex(p => p.id === this.currentPlayer.id);
            if(pIdx !== -1) {
                this.players[pIdx].lastRating = this.currentEval.overallScore;
                storage.savePlayers(this.players);
            }
            
            this.selectPlayer(this.players[pIdx]); // Retour fiche
        },

        // --- CHART JS ---
        renderChart() {
            const ctx = document.getElementById('radarChart');
            if (!ctx || !this.playerEvaluations.length) return;

            const lastEval = this.playerEvaluations[0];
            const data = [
                lastEval.averages.mental,
                lastEval.averages.physical,
                lastEval.averages.defense,
                lastEval.averages.shooting,
                lastEval.averages.dribbling,
                lastEval.averages.passing
            ];

            if (this.chartInstance) this.chartInstance.destroy();

            this.chartInstance = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Mental', 'Physique', 'Défense', 'Tir', 'Dribble', 'Passe'],
                    datasets: [{
                        label: 'Niveau Actuel',
                        data: data,
                        backgroundColor: 'rgba(234, 88, 12, 0.2)',
                        borderColor: '#ea580c',
                        pointBackgroundColor: '#ea580c'
                    }]
                },
                options: {
                    scales: { r: { min: 0, max: 10 } }
                }
            });
        }
    }
}).mount('#app');
