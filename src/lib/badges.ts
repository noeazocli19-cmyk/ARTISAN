// Calcule le badge d'un artisan a partir de ses statistiques reelles.
// Appelee a chaque fois que missionCount, reviewCount ou rating changent,
// pour que le badge reste toujours synchronise avec l'activite reelle.
export function computeArtisanBadge(missionCount: number, reviewCount: number, rating: number): string {
  if (missionCount >= 10 && rating >= 4.5 && reviewCount >= 5) {
    return "Elite";
  }
  if (missionCount >= 3 && rating >= 4.0) {
    return "Top";
  }
  return "Nouveau";
}