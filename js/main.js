// js/main.js
import { categoryNames, evaluationSchema } from './config.js';
import { storage } from './storage.js';
import { playerManager } from './playerManager.js';

const { createApp } = Vue;

createApp({
    data() {
        return {
            currentView: 'list',
            isLoading: false, // Pour afficher un chargement
            players: [],
            evaluations: [],
            
            filters: { search: '', category: '' },
            
            formPlayer: playerManager.createEmpty(),
            currentPlayer: null,
            currentEval: null,
            
            schema: evaluationSchema,
            catNames: categoryNames,
            chartInstance: null
        };
    },
    computed: {
        filteredPlayers() {
            return this.players.filter(p => {
                // Vérification de sécurité si les données ne sont pas encore chargées
                if(!p) return false; 
                const matchName = (p.firstName + ' ' + p.lastName).toLowerCase().includes(this.filters.search.toLowerCase());
                const matchCat = this.filters.category ? p.category === this.filters.category : true;
                return matchName && matchCat;
            });
        },
        playerEvaluations() {
            if (!this.currentPlayer) return [];
            return this.evaluations
                .filter(e => e.playerId === this.currentPlayer.id) // Note: on compare avec l'ID interne
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
    // Le mounted devient ASYNC pour charger les données
    async mounted() {
        this.isLoading = true;
        try {
            // On charge les deux collections en parallèle
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
                // On utilise l'ID généré localement pour lier (id) mais Firebase gérera le sien (firestoreId)
                if (!this.formPlayer.id) {
                    this.formPlayer.id = crypto.randomUUID(); 
                }
                
                // Sauvegarde Cloud
                const savedPlayer = await storage.savePlayer(this.formPlayer);
                
                // Mise à jour locale (sans recharger toute la page)
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
                // Pas d'ID Firestore ici, il sera créé à la sauvegarde
                playerId: this.currentPlayer.id, // Lien avec le joueur
                date: new Date().toISOString().split('T')[0],
                ratings: {},
                evaluator: 'Coach' // Tu pourras rendre ça dynamique plus tard
            };
            for (const cat in this.schema) {
                this.currentEval.ratings[cat] = {};
                this.schema[cat].forEach(c => this.currentEval.ratings[cat][c.key] = 5);
            }
            this.currentView = 'evaluate';
        },
        
        async submitEval() {
            this.isLoading = true;
            try {
                // 1. Calculs
                this.currentEval.overallScore = this.liveScore;
                const avgs = {};
                for(const cat in this.currentEval.ratings) {
                    let sum = 0, c = 0;
                    Object.values(this.currentEval.ratings[cat]).forEach(v => { sum += v; c++; });
                    avgs[cat] = (sum/c).toFixed(1);
                }
                this.currentEval.averages = avgs;

                // 2. Sauvegarde Cloud de l'évaluation
                const savedEval = await storage.saveEvaluation(this.currentEval);
                this.evaluations.unshift(savedEval); // Ajout en haut de liste locale

                // 3. Mise à jour de la note du joueur (Cloud + Local)
                const pIdx = this.players.findIndex(p => p.id === this.currentPlayer.id);
                if(pIdx !== -1) {
                    this.players[pIdx].lastRating = this.currentEval.overallScore;
                    // On sauvegarde juste le joueur mis à jour
                    await storage.savePlayer(this.players[pIdx]);
                }

                this.selectPlayer(this.players[pIdx]); // Retour fiche
            } catch (e) {
                console.error(e);
                alert("Erreur lors de la sauvegarde de l'évaluation");
            } finally {
                this.isLoading = false;
            }
        },

        // --- CHART JS (Inchangé) ---
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
