// js/storage.js
import { db } from './firebaseConfig.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const COLLECTIONS = {
    PLAYERS: 'players',
    EVALS: 'evaluations'
};

export const storage = {
    // --- JOUEURS ---
    async getPlayers() {
        const q = query(collection(db, COLLECTIONS.PLAYERS), orderBy("lastName"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async savePlayer(player) {
        if (player.firestoreId) {
            // Mise à jour (Update)
            const playerRef = doc(db, COLLECTIONS.PLAYERS, player.firestoreId);
            const { firestoreId, ...dataToSave } = player; 
            await updateDoc(playerRef, dataToSave);
            return player;
        } else {
            // Création (Create)
            const docRef = await addDoc(collection(db, COLLECTIONS.PLAYERS), player);
            return { ...player, firestoreId: docRef.id, id: docRef.id }; 
        }
    },

    // --- EVALUATIONS ---
    async getEvaluations() {
        const q = query(collection(db, COLLECTIONS.EVALS), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // id ici est l'ID Firestore
    },

    async saveEvaluation(evaluation) {
        if (evaluation.id) {
            // Mise à jour d'une évaluation existante
            const evalRef = doc(db, COLLECTIONS.EVALS, evaluation.id);
            // On s'assure de ne pas ré-écrire l'ID dans le document lui-même si Firebase ne l'aime pas
            const { id, ...dataToSave } = evaluation;
            await updateDoc(evalRef, dataToSave);
            return evaluation;
        } else {
            // Création
            const docRef = await addDoc(collection(db, COLLECTIONS.EVALS), evaluation);
            return { ...evaluation, id: docRef.id };
        }
    },

    // Nouvelle fonction : Supprimer une évaluation
    async deleteEvaluation(evalId) {
        if (!evalId) return;
        await deleteDoc(doc(db, COLLECTIONS.EVALS, evalId));
    }
};
