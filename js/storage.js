// js/storage.js
import { db } from './firebaseConfig.js';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const COLLECTIONS = {
    PLAYERS: 'players',
    EVALS: 'evaluations'
};

export const storage = {
    // --- JOUEURS ---
    
    // Récupérer tous les joueurs
    async getPlayers() {
        const q = query(collection(db, COLLECTIONS.PLAYERS), orderBy("lastName"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Ajouter ou mettre à jour un joueur
    async savePlayer(player) {
        // Si le joueur a déjà un ID de Firestore, on met à jour
        if (player.firestoreId) {
            const playerRef = doc(db, COLLECTIONS.PLAYERS, player.firestoreId);
            // On retire firestoreId de l'objet avant d'envoyer pour éviter la redondance
            const { firestoreId, ...dataToSave } = player; 
            await updateDoc(playerRef, dataToSave);
            return player;
        } else {
            // Sinon, on crée un nouveau document
            const docRef = await addDoc(collection(db, COLLECTIONS.PLAYERS), player);
            // On retourne le joueur avec son nouvel ID
            return { ...player, firestoreId: docRef.id, id: docRef.id }; 
        }
    },

    // --- EVALUATIONS ---

    async getEvaluations() {
        const q = query(collection(db, COLLECTIONS.EVALS), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async saveEvaluation(evaluation) {
        const docRef = await addDoc(collection(db, COLLECTIONS.EVALS), evaluation);
        return { ...evaluation, id: docRef.id };
    }
};
