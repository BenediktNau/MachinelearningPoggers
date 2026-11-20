// Alle Stellschrauben an einer Stelle. Die UI (helper/ui.ts) schreibt direkt in dieses Objekt.
export const params = {
  population: 50, // Anzahl Autos (wirkt nach Neustart)
  hiddenSize: 8, // Neuronen der versteckten Schicht (wirkt nach Neustart)
  elite: 5, // die besten N Autos kommen unverändert in die nächste Generation
  mutationRate: 0.2, // Anteil der Gewichte, die bei einem Kind verändert werden
  mutationStrength: 0.4, // maximale Änderung pro Gewicht
  timeout: 20, // Sekunden pro Generation
  simSpeed: 1, // Zeitraffer
  showRays: true,
};

export type Params = typeof params;
