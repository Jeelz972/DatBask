// js/main.js
import { categoryNames, evaluationSchema } from './config.js';
import { storage } from './storage.js';
import { playerManager } from './playerManager.js';

const { createApp } = Vue;

// On stocke l'application dans une constante pour éviter l'erreur de syntaxe
const app = createApp({
    data() {
        return {
            currentView: 'list',
            isLoading: false,
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
                if(!p) return false;
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
    // Chargement asynchrone (Firebase)
    async mounted() {
        this.isLoading = true;
        try {
            const [playersData, evalsData] = await Promise.all([
                storage.getPlayers(),
                storage.getEvaluations()
            ]);
            this.players = playersData;
            this.evaluations = evalsData;
        } catch (error) {
            console.error("Erreur chargement Firebase:", error);
            alert("Erreur de connexion à la base de données");
        } finally {
            this.isLoading = false;
        }
    },
    methods: {
        changeView(view) { this.currentView = view; },
        getScoreColor: playerManager.getScoreColor,
        
        // --- GESTION JOUEUR ---
        prepareNewPlayer() {
            this.formPlayer = playerManager.createEmpty();
            this.currentView = 'playerForm';
        },
        
        async savePlayerForm() {
            this.isLoading = true;
            try {
                if (!this.formPlayer.id) {
                    this.formPlayer.id = crypto.randomUUID(); 
                }
                
                const savedPlayer = await storage.savePlayer(this.formPlayer);
                
                const index = this.players.findIndex(p => p.id === savedPlayer.id);
                if (index !== -1) {
                    this.players[index] = savedPlayer;
                } else {
                    this.players.push(savedPlayer);
                }
                
                this.currentView = 'list';
            } catch (e) {
                console.error(e);
                alert("Erreur lors de la sauvegarde du joueur");
            } finally {
                this.isLoading = false;
            }
        },
        
        selectPlayer(player) {
            this.currentPlayer = player;
            this.currentView = 'playerDetail';
            setTimeout(() => this.renderChart(), 100);
        },

        // --- GESTION EVALUATION ---
        startEvaluation() {
            this.currentEval = {
                playerId: this.currentPlayer.id,
                date: new Date().toISOString().split('T')[0],
                ratings: {},
                evaluator: 'Coach' 
            };
            // Initialisation des notes à 5
            for (const cat in this.schema) {
                this.currentEval.ratings[cat] = {};
                this.schema[cat].forEach(c => this.currentEval.ratings[cat][c.key] = 5);
            }
            this.currentView = 'evaluate';
        },
        
        async submitEval() {
            this.isLoading = true;
            try {
                this.currentEval.overallScore = this.liveScore;
                
                const avgs = {};
                for(const cat in this.currentEval.ratings) {
                    let sum = 0, c = 0;
                    Object.values(this.currentEval.ratings[cat]).forEach(v => { sum += v; c++; });
                    avgs[cat] = (sum/c).toFixed(1);
                }
                this.currentEval.averages = avgs;

                const savedEval = await storage.saveEvaluation(this.currentEval);
                this.evaluations.unshift(savedEval);

                const pIdx = this.players.findIndex(p => p.id === this.currentPlayer.id);
                if(pIdx !== -1) {
                    this.players[pIdx].lastRating = this.currentEval.overallScore;
                    await storage.savePlayer(this.players[pIdx]);
                }

                this.selectPlayer(this.players[pIdx]); 
            } catch (e) {
                console.error(e);
                alert("Erreur lors de la sauvegarde de l'évaluation");
            } finally {
                this.isLoading = false;
            }
        },

        // --- CHART JS ---
        renderChart() {
            const ctx = document.getElementById('radarChart');
            if (!ctx || !this.playerEvaluations.length) return;

            const lastEval = this.playerEvaluations[0];

            // 4 Axes
            const data = [
                lastEval.averages.mental || 0,
                lastEval.averages.physical || 0,
                lastEval.averages.technical || 0,
                lastEval.averages.tactical || 0
            ];

            if (this.chartInstance) this.chartInstance.destroy();

            this.chartInstance = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['🧠 Mental', '⚡ Physique', '🏀 Technique', '♟️ Tactique'],
                    datasets: [{
                        label: 'Niveau Actuel',
                        data: data,
                        backgroundColor: 'rgba(234, 88, 12, 0.4)',
                        borderColor: '#ea580c',
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#ea580c',
                        pointHoverBackgroundColor: '#ea580c',
                        borderWidth: 2
                    }]
                },
                options: {
                    scales: {
                        r: {
                            min: 0,
                            max: 10,
                            ticks: { stepSize: 2, backdropColor: 'transparent' },
                            pointLabels: { font: { size: 14, weight: 'bold' } }
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
    }
});

// C'est ici que l'erreur se produisait. Maintenant c'est propre :
app.mount('#app');
