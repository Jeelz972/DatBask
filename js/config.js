// js/config.js

export const categoryNames = {
    mental: '🧠 Mental & Attitude',
    physical: '⚡ Physique & Moteur',
    technical: '🏀 Technique & Skills',
    tactical: '♟️ Tactique & QI Basket'
};

// Liste des Archétypes NBA 2K style
export const playerArchetypes = [
    "Non défini",
    "Général du Parquet (Playmaker)",
    "Scoreur 3 Niveaux",
    "Menace Offensive & Défensive (2-Way)",
    "Cadenas Extérieur (Lockdown)",
    "Tireur d'Élite (Sharpshooter)",
    "Slasher / Finisseur",
    "Ailier Polyvalent (All-Around)",
    "Intérieur Fuyant (Stretch Big)",
    "Protecteur de Cercle (Rim Protector)",
    "Monstre de la Raquette (Paint Beast)",
    "Nettoyeur de Raquette (Rebondeur)"
];

export const evaluationSchema = {
    mental: [
        { key: 'coachability', label: 'Coachabilité & Écoute' },
        { key: 'resilience', label: 'Gestion de l\'échec (Résilience)' },
        { key: 'leadership', label: 'Leadership & Communication' },
        { key: 'workEthic', label: 'Éthique de travail' },
        { key: 'grinta', label: 'Compétitivité (Grinta)' }
    ],
    physical: [
        { key: 'explosiveness', label: 'Explosivité & 1er pas' },
        { key: 'endurance', label: 'Endurance (VMA spécifique)' },
        { key: 'impact', label: 'Impact & Gainage' },
        { key: 'laterality', label: 'Latéralité & Jeu de jambes' },
        { key: 'stability', label: 'Proprioception & Prévention' }
    ],
    technical: [
        { key: 'shooting', label: 'Tir (Mécanique & Sélection)' },
        { key: 'handle', label: 'Aisance balle en main' },
        { key: 'passing', label: 'Qualité de passe' },
        { key: 'offBall', label: 'Jeu sans ballon (Cutting)' },
        { key: 'finishing', label: 'Finition au cercle' }
    ],
    tactical: [
        { key: 'pnr', label: 'Lecture Pick & Roll' },
        { key: 'spacing', label: 'Spacing & Occupation' },
        { key: 'rotation', label: 'Rotations Défensives' },
        { key: 'gameMgmt', label: 'Gestion (Temps/Score)' },
        { key: 'readDefense', label: 'Lecture défense adverse' }
    ]
};
