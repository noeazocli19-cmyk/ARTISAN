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
