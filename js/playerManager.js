export const playerManager = {
    // Génère un objet joueur vide prêt à être rempli
    createEmpty() {
        return {
            id: null, // Sera généré à la sauvegarde
            firstName: '',
            lastName: '',
            number: '',
            birthDate: '',
            category: 'U18',
            team: 'Équipe 1',
            morphology: { height: '', weight: '', dominantHand: 'Droite' },
            profile: { primaryPosition: 'Meneuse', offensiveProfile: '' },
            lastRating: null
        };
    },

    // Calcule la couleur du badge en fonction de la note
    getScoreColor(score) {
        const s = parseFloat(score);
        if (!s) return 'bg-gray-400';
        if (s >= 8) return 'bg-green-600';
        if (s >= 6) return 'bg-yellow-500';
        if (s >= 4) return 'bg-orange-500';
        return 'bg-red-600';
    }
};
