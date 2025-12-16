// js/playerManager.js
export const playerManager = {
    createEmpty() {
        return {
            id: null, 
            firstName: '',
            lastName: '',
            number: '',
            birthDate: '',
            category: 'U18',
            team: 'Équipe 1',
            // Nouvel attribut
            archetype: 'Non défini', 
            morphology: { height: '', weight: '', dominantHand: 'Droite' },
            profile: { primaryPosition: 'Meneuse', offensiveProfile: '' },
            lastRating: null
        };
    },

    getScoreColor(score) {
        const s = parseFloat(score);
        if (!s) return 'bg-gray-400';
        if (s >= 8) return 'bg-green-600';
        if (s >= 6) return 'bg-yellow-500';
        if (s >= 4) return 'bg-orange-500';
        return 'bg-red-600';
    }
};
