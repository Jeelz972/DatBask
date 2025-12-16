// Configuration des catégories d'évaluation
export const categoryNames = {
    shooting: '🎯 Tir & Finition',
    dribbling: '🏀 Dribble & Création',
    passing: '👁️ Passe & Vision',
    defense: '🛡️ Défense',
    physical: '💪 Physique',
    mental: '🧠 Mental'
};

export const evaluationSchema = {
    shooting: [
        {key: 'midRange', label: 'Tir mi-distance'}, {key: 'offDribble', label: 'Tir après dribble'},
        {key: 'threePoint', label: 'Tir à 3 points'}, {key: 'layupRight', label: 'Lay-up Droit'},
        {key: 'layupLeft', label: 'Lay-up Gauche'}, {key: 'freeThrow', label: 'Lancer franc'}
    ],
    dribbling: [
        {key: 'rightHand', label: 'Main Droite'}, {key: 'leftHand', label: 'Main Gauche'},
        {key: 'changeDir', label: 'Chgt Direction'}, {key: 'penetration', label: 'Pénétration'},
        {key: 'createSelf', label: 'Création pour soi'}
    ],
    passing: [
        {key: 'shortPass', label: 'Passe courte'}, {key: 'longPass', label: 'Passe longue'},
        {key: 'vision', label: 'Vision'}, {key: 'iq', label: 'Lecture jeu'},
        {key: 'createOthers', label: 'Création pour autres'}
    ],
    defense: [
        {key: 'individual', label: 'Individuelle'}, {key: 'help', label: 'Aide'},
        {key: 'steal', label: 'Interception'}, {key: 'block', label: 'Contre'},
        {key: 'rebound', label: 'Rebond'}, {key: 'comm', label: 'Communication'}
    ],
    physical: [
        {key: 'speed', label: 'Vitesse'}, {key: 'explosiveness', label: 'Explosivité'},
        {key: 'agility', label: 'Agilité'}, {key: 'strength', label: 'Force'},
        {key: 'endurance', label: 'Endurance'}, {key: 'coord', label: 'Coordination'}
    ],
    mental: [
        {key: 'focus', label: 'Concentration'}, {key: 'leadership', label: 'Leadership'},
        {key: 'teamSpirit', label: 'Esprit équipe'}, {key: 'pressure', label: 'Gestion Pression'},
        {key: 'fight', label: 'Combativité'}, {key: 'discipline', label: 'Discipline'}
    ]
};
