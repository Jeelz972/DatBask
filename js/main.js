// js/main.js

// 1. AJOUTER L'IMPORT EN HAUT DU FICHIER
import { categoryNames, evaluationSchema, playerArchetypes } from './config.js';
import { storage } from './storage.js';
import { playerManager } from './playerManager.js';
import { calculateArchetype } from './archetypeLogic.js'; // <--- NOUVEAU

const { createApp } = Vue;

const app = createApp({
    // ... (data, computed, mounted restent identiques) ...

    methods: {
        // ... (les autres méthodes restent identiques) ...

        // 2. MODIFIER LA FONCTION submitEval
        async submitEval() {
            this.isLoading = true;
            try {
                this.currentEval.overallScore = this.liveScore;
                
                // Calcul moyennes (Code existant)
                const avgs = {};
                for(const cat in this.currentEval.ratings) {
                    let sum = 0, c = 0;
                    Object.values(this.currentEval.ratings[cat]).forEach(v => { sum += v; c++; });
                    avgs[cat] = (sum/c).toFixed(1);
                }
                this.currentEval.averages = avgs;

                // Sauvegarde de l'évaluation
                const savedEval = await storage.saveEvaluation(this.currentEval);

                // Gestion liste locale
                if (this.isEditingEval) {
                    const idx = this.evaluations.findIndex(e => e.id === savedEval.id);
                    if(idx !== -1) this.evaluations[idx] = savedEval;
                } else {
                    this.evaluations.unshift(savedEval);
                }

                // --- NOUVEAU : CALCUL AUTOMATIQUE DE L'ARCHÉTYPE ---
                // On détermine le nouvel archétype basé sur CETTE évaluation
                const newArchetype = calculateArchetype(this.currentEval.ratings);
                
                // On met à jour le joueur
                const pIdx = this.players.findIndex(p => p.id === this.currentPlayer.id);
                if(pIdx !== -1) {
                    this.players[pIdx].lastRating = this.currentEval.overallScore;
                    this.players[pIdx].archetype = newArchetype; // <--- Mise à jour auto
                    
                    // Sauvegarde du joueur avec son nouveau badge
                    await storage.savePlayer(this.players[pIdx]);
                }

                this.selectPlayer(this.players.find(p => p.id === this.currentPlayer.id)); 
                
                // Petit feedback visuel (optionnel)
                alert(`Évaluation sauvegardée ! Archétype détecté : ${newArchetype}`);

            } catch (e) {
                console.error(e);
                alert("Erreur lors de la sauvegarde");
            } finally {
                this.isLoading = false;
            }
        },

        // ... (le reste reste identique) ...
    }
});
app.mount('#app');
