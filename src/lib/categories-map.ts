// Correspondance entre le nom de catégorie affiché sur la page d'accueil
// et les valeurs réelles du champ "profession" enregistrées en base.
// Sert à faire matcher un artisan avec une catégorie même si le mot exact
// diffère (ex: catégorie "Plomberie" doit trouver les artisans "Plombier").
export const CATEGORY_PROFESSION_MAP: Record<string, string[]> = {
  "Plomberie": ["Plombier", "Plomberie"],
  "Électricité": ["Electricien", "Électricien", "Electricite", "Électricité"],
  "Menuiserie": ["Menuisier", "Menuiserie"],
  "Peinture": ["Peintre", "Peinture"],
  "Serrurerie": ["Serrurier", "Serrurerie"],
  "Maçonnerie": ["Macon", "Maçon", "Maconnerie", "Maçonnerie"],
  "Climatisation": ["Climatiseur", "Climatisation", "Refrigerateur", "Réfrigérateur", "Frigoriste"],
  "Nettoyage": ["Agent de nettoyage", "Nettoyeur", "Nettoyage"],
  "Soudure": ["Soudeur", "Soudure"],
  "Carrelage": ["Carreleur", "Carrelage"],
  "Couture": ["Couturier", "Couturière", "Tailleur", "Couture"],
  "Couvreur": ["Couvreur"],
  "Plâtrerie": ["Plâtrier", "Platrier", "Plâtrerie", "Platrerie"],
  "Pâtisserie": ["Pâtissier", "Patissier", "Pâtisserie", "Patisserie"],
  "Mécanique": ["Mechanicien", "Mécanicien", "Mecanicien", "Mécanique"],
  "Coiffure": ["Coiffeur", "Coiffeuse", "Coiffure"],
  "Paysagisme": ["Paysagiste", "Paysagisme"],
  "Vitrerie": ["Vitrier", "Vitrerie"],
  "Forgeron": ["Ferronnier", "Forgeron"],
  "Photographie": ["Photographe", "Photographie"],
};

// Nouveaux métiers (forme "job title") à proposer à l'inscription pour que
// les catégories affichées sur la page d'accueil aient toutes un métier
// correspondant que les artisans peuvent réellement choisir.
export const NEW_PROFESSIONS_TO_ADD = [
  "Serrurier",
  "Climatiseur",
  "Agent de nettoyage",
  "Couvreur",
  "Plâtrier",
  "Pâtissier",
  "Paysagiste",
  "Vitrier",
  "Photographe",
];

export function getSynonymsForCategory(category: string): string[] {
  return CATEGORY_PROFESSION_MAP[category] || [category];
}

// Sous-problèmes proposés dynamiquement selon le métier choisi lors de la
// publication d'une mission (ex: Plomberie → "Fuite d'eau", "Robinet défectueux").
// Sert uniquement à préremplir le titre/la description ; aucune colonne de
// base de données supplémentaire n'est nécessaire.
export const ISSUES_BY_CATEGORY: Record<string, string[]> = {
  "Plomberie": ["Fuite d'eau", "Robinet défectueux", "Toilette bouchée", "Chauffe-eau en panne", "Tuyau cassé", "Autre"],
  "Électricité": ["Panne de courant", "Prise défectueuse", "Court-circuit", "Installation nouvelle", "Disjoncteur qui saute", "Autre"],
  "Menuiserie": ["Porte cassée", "Meuble à réparer", "Fabrication sur mesure", "Fenêtre bloquée", "Autre"],
  "Peinture": ["Peinture intérieure", "Peinture extérieure", "Rénovation façade", "Retouches", "Autre"],
  "Serrurerie": ["Porte claquée", "Clé perdue", "Serrure à changer", "Ouverture de porte", "Autre"],
  "Maçonnerie": ["Fissure sur un mur", "Construction", "Rénovation", "Carrelage", "Autre"],
  "Climatisation": ["Climatiseur en panne", "Installation climatiseur", "Entretien/nettoyage", "Fuite de gaz", "Autre"],
  "Nettoyage": ["Nettoyage maison", "Nettoyage bureau", "Nettoyage après travaux", "Nettoyage canapé/tapis", "Autre"],
  "Cuisine": ["Réparation électroménager", "Installation cuisine", "Fuite évier", "Autre"],
  "Jardinage": ["Entretien jardin", "Taille de haie", "Tonte de pelouse", "Aménagement paysager", "Autre"],
  "Réparation auto": ["Panne moteur", "Vidange", "Pneu crevé", "Freins", "Autre"],
  "Autre": ["Autre besoin"],
};

export function getIssuesForCategory(category: string): string[] {
  return ISSUES_BY_CATEGORY[category] || ["Autre"];
}
