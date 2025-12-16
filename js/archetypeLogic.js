// js/archetypeLogic.js

export function calculateArchetype(ratings) {
    // Fonction utilitaire pour éviter les erreurs si une note est vide
    const getVal = (cat, key) => ratings[cat] && ratings[cat][key] ? ratings[cat][key] : 0;

    // --- 1. CALCUL DES SCORES PAR DOMAINE ---
    
    // Tir
    const shootScore = getVal('technical', 'shooting');
    
    // Finition / Athlétique
    const slashScore = (getVal('technical', 'finishing') + getVal('physical', 'explosiveness')) / 2;
    
    // Playmaking (Jeu de passe + Intelligence)
    const playScore = (getVal('technical', 'passing') + getVal('technical', 'handle') + getVal('tactical', 'pnr')) / 3;
    
    // Défense
    const defScore = (getVal('physical', 'laterality') + getVal('tactical', 'readDefense') + getVal('physical', 'impact')) / 3;
    
    // Intérieur (Poste bas + Rebond)
    const insideScore = (getVal('physical', 'impact') + getVal('technical', 'finishing')) / 2;

    // Moyenne Globale
    let total = 0;
    let count = 0;
    for (const cat in ratings) {
        for (const key in ratings[cat]) {
            total += ratings[cat][key];
            count++;
        }
    }
    const globalAvg = count > 0 ? total / count : 0;

    // --- 2. ARBRE DE DÉCISION ---

    // Élites
    if (globalAvg >= 8.0) {
        if (defScore >= 8 && shootScore >= 8) return "Menace Offensive & Défensive (2-Way)";
        return "Ailier Polyvalent (All-Around)";
    }

    // Tireurs
    if (shootScore >= 8) {
        if (playScore >= 7) return "Meneur Scoreur";
        return "Tireur d'Élite (Sharpshooter)";
    }

    // Gestionnaires
    if (playScore >= 7.5 && playScore > shootScore) {
        return "Général du Parquet (Playmaker)";
    }

    // Défenseurs
    if (defScore >= 8 && defScore > shootScore && defScore > slashScore) {
        if (insideScore >= 7) return "Protecteur de Cercle (Rim Protector)";
        return "Cadenas Extérieur (Lockdown)";
    }

    // Finisseurs
    if (slashScore >= 7.5) {
        return "Slasher / Finisseur";
    }

    // Intérieurs
    if (insideScore >= 7.5) {
        if (shootScore >= 6) return "Intérieur Fuyant (Stretch Big)";
        return "Monstre de la Raquette (Paint Beast)";
    }

    // Autres
    if (globalAvg >= 6) return "Joueur de Rotation (Role Player)";
    
    return "Prospect en Développement";
}
