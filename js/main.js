// js/main.js
import { categoryNames, evaluationSchema, playerArchetypes } from './config.js';
import { storage } from './storage.js';
import { playerManager } from './playerManager.js';

const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            currentView: 'list',
            isLoading: false,
            players: [],
            evaluations: [],
            
            // Filtres (Ajout du filtre Archetype)
            filters: { search: '', category: '', archetype: '' },
            
            formPlayer: playerManager.createEmpty(),
            currentPlayer: null,
            currentEval: null,
            isEditingEval: false, // Savoir si on modifie ou crée
            
            // Config importée
            schema: evaluationSchema,
            catNames: categoryNames,
            archetypesList: playerArchetypes, // Liste importée
            chartInstance: null
        };
    },
    computed: {
        filteredPlayers() {
            return this.players.filter(p => {
                if(!p) return false;
                const matchName = (p.firstName + ' ' + p.lastName).toLowerCase().includes(this.filters.search.toLowerCase());
                const matchCat = this.filters.category ? p.category === this.filters.category : true;
                // Filtre par Archétype
                const matchArch = this.filters.archetype ? p.archetype === this.filters.archetype : true;
                return matchName && matchCat && matchArch;
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
                if (!this.formPlayer.id) this.formPlayer.id = crypto.randomUUID(); 
                
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

        // --- GESTION EVALUATION (CREATE / EDIT / DELETE) ---
        
        startEvaluation() {
            this.isEditingEval = false;
            this.currentEval = {
                playerId: this.currentPlayer.id,
                date: new Date().toISOString().split('T')[0],
                ratings: {},
                evaluator: 'Coach'
            };
            for (const cat in this.schema) {
                this.currentEval.ratings[cat] = {};
                this.schema[cat].forEach(c => this.currentEval.ratings[cat][c.key] = 5);
            }
            this.currentView = 'evaluate';
        },

        // Fonction pour charger une évaluation existante
        editEvaluation(evalData) {
            this.isEditingEval = true;
            // On fait une copie profonde pour ne pas modifier la liste tant qu'on n'a pas sauvegardé
            this.currentEval = JSON.parse(JSON.stringify(evalData));
            this.currentView = 'evaluate';
        },

        // Fonction pour supprimer
        async deleteEvaluation(evalId) {
            if(!confirm("Es-tu sûr de vouloir supprimer cette évaluation ?")) return;
            
            this.isLoading = true;
            try {
                await storage.deleteEvaluation(evalId);
                // Retirer de la liste locale
                this.evaluations = this.evaluations.filter(e => e.id !== evalId);
                
                // Mettre à jour la note globale du joueur (revenir à l'éval précédente)
                await this.refreshPlayerRating();
                
                // Rafraichir le graphique
                this.renderChart();
            } catch (e) {
                console.error(e);
                alert("Erreur lors de la suppression");
            } finally {
                this.isLoading = false;
            }
        },

        async submitEval() {
            this.isLoading = true;
            try {
                this.currentEval.overallScore = this.liveScore;
                
                // Calcul moyennes
                const avgs = {};
                for(const cat in this.currentEval.ratings) {
                    let sum = 0, c = 0;
                    Object.values(this.currentEval.ratings[cat]).forEach(v => { sum += v; c++; });
                    avgs[cat] = (sum/c).toFixed(1);
                }
                this.currentEval.averages = avgs;

                // Sauvegarde Cloud (Création ou Update géré par storage)
                const savedEval = await storage.saveEvaluation(this.currentEval);

                if (this.isEditingEval) {
                    // Si on édite, on remplace dans la liste locale
                    const idx = this.evaluations.findIndex(e => e.id === savedEval.id);
                    if(idx !== -1) this.evaluations[idx] = savedEval;
                } else {
                    // Si nouveau, on ajoute
                    this.evaluations.unshift(savedEval);
                }

                // Mettre à jour la note du joueur
                await this.refreshPlayerRating();

                this.selectPlayer(this.players.find(p => p.id === this.currentPlayer.id)); 
            } catch (e) {
                console.error(e);
                alert("Erreur lors de la sauvegarde");
            } finally {
                this.isLoading = false;
            }
        },

        // Utilitaire pour recalculer la note du joueur selon sa dernière évaluation valide
        async refreshPlayerRating() {
            // On ré-filtre les évals du joueur actuel
            const pEvals = this.evaluations
                .filter(e => e.playerId === this.currentPlayer.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            const pIdx = this.players.findIndex(p => p.id === this.currentPlayer.id);
            if(pIdx !== -1) {
                // Si il reste des évals, on prend la plus récente, sinon null
                this.players[pIdx].lastRating = pEvals.length > 0 ? pEvals[0].overallScore : null;
                await storage.savePlayer(this.players[pIdx]);
            }
        },

        renderChart() {
            const ctx = document.getElementById('radarChart');
            if (!ctx) return;
            
            // Si pas d'éval, on affiche un graph vide ou rien
            if (!this.playerEvaluations.length) {
                if(this.chartInstance) this.chartInstance.destroy();
                return;
            }

            const lastEval = this.playerEvaluations[0];
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
                        borderWidth: 2
                    }]
                },
                options: {
                    scales: {
                        r: {
                            min: 0, max: 10,
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

app.mount('#app');
