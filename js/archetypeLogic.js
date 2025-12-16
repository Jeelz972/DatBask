// js/archetypeLogic.js

/**
 * Analyse les notes d'évaluation et retourne l'archétype correspondant.
 * @param {Object} ratings - L'objet contenant les notes (mental, physical, technical, tactical)
 * @returns {String} - Le nom de l'archétype
 */
export function calculateArchetype(ratings) {
    // 1. On extrait les notes clés (valeur par défaut 0 si non noté)
    const getVal = (cat, key) => ratings[cat] && ratings[cat][key] ? ratings[cat][key] : 0;

    // --- CALCUL DES SCORES PAR DOMAINE ---
    
    // Tir (Shooting)
    const shootScore = getVal('technical', 'shooting');
    
    // Finition / Pénétration (Finishing + Explosiveness)
    const slashScore = (getVal('technical', 'finishing') + getVal('physical', 'explosiveness')) / 2;
    
    // Playmaking (Passe + Handle + Vision/IQ)
    const playScore = (getVal('technical', 'passing') + getVal('technical', 'handle') + getVal('tactical', 'pnr')) / 3;
    
    // Défense (Latéralité + Lecture défensive + Impact)
    const defScore = (getVal('physical', 'laterality') + getVal('tactical', 'readDefense') + getVal('physical', 'impact')) / 3;
    
    // Intérieur / Rebond (Impact + Finition)
    const insideScore = (getVal('physical', 'impact') + getVal('technical', 'finishing')) / 2;

    // Global (Moyenne générale)
    let total = 0;
    let count = 0;
    for (const cat in ratings) {
        for (const key in ratings[cat]) {
            total += ratings[cat][key];
            count++;
        }
    }
    const globalAvg = count > 0 ? total / count : 0;

    // --- LOGIQUE DE DÉCISION (ARBRE DE DÉCISION) ---

    // 1. Les Élites Polyvalents (Si tout est fort)
    if (globalAvg >= 8.0) {
        if (defScore >= 8 && shootScore >= 8) return "Menace Offensive & Défensive (2-Way)";
        return "Ailier Polyvalent (All-Around)";
    }

    // 2. Les Spécialistes du Tir
    if (shootScore >= 8) {
        if (playScore >= 7) return "Meneur Scoreur";
        return "Tireur d'Élite (Sharpshooter)";
    }

    // 3. Les Gestionnaires
    if (playScore >= 7.5 && playScore > shootScore) {
        return "Général du Parquet (Playmaker)";
    }

    // 4. Les Défenseurs
    if (defScore >= 8 && defScore > shootScore && defScore > slashScore) {
        if (insideScore >= 7) return "Protecteur de Cercle (Rim Protector)";
        return "Cadenas Extérieur (Lockdown)";
    }

    // 5. Les Finisseurs / Slashers
    if (slashScore >= 7.5) {
        return "Slasher / Finisseur";
    }

    // 6. Les Intérieurs
    if (insideScore >= 7.5) {
        if (shootScore >= 6) return "Intérieur Fuyant (Stretch Big)";
        return "Monstre de la Raquette (Paint Beast)";
    }

    // 7. Niveau Intermédiaire ou En développement
    if (globalAvg >= 6) return "Joueur de Rotation (Role Player)";
    
    return "Prospect en Développement";
}
