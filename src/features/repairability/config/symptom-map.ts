import type { SelectOption } from "../types";

const genericSymptoms: SelectOption[] = [
  { value: "ne_s_allume_pas", label: "Ne s'allume pas" },
  { value: "s_allume_mais_inactif", label: "S'allume mais ne fonctionne pas" },
  { value: "perte_puissance", label: "Perte de puissance" },
  { value: "bruit_anormal", label: "Bruit anormal" },
  { value: "odeur_brule", label: "Odeur de brule" },
  { value: "fuite", label: "Fuite" },
  { value: "chauffe_anormale", label: "Chauffe anormale" },
  { value: "vibration", label: "Vibration" },
  { value: "voyant_erreur", label: "Voyant erreur" },
  { value: "arret_aleatoire", label: "Arret aleatoire" },
];

const byObjectType: Record<string, SelectOption[]> = {
  aspirateur: [
    { value: "aspiration_faible", label: "Aspiration faible" },
    { value: "brosse_bloquee", label: "Brosse bloquee" },
    { value: "obstruction", label: "Obstruction flexible/tube" },
  ],
  cafetiere: [
    { value: "pas_ecoulement", label: "Le cafe ne coule pas" },
    { value: "pas_chauffe", label: "Ne chauffe plus" },
    { value: "entartrage_suspect", label: "Entartrage suspecte" },
  ],
  outil_electrique: [
    { value: "moteur_faible", label: "Moteur faible" },
    { value: "blocage_mecanique", label: "Blocage mecanique" },
    { value: "demarrage_difficile", label: "Demarrage difficile" },
  ],
  taille_haie: [
    { value: "lame_bloquee", label: "Lame bloquee" },
    { value: "moteur_faible", label: "Moteur faible" },
    { value: "coupures_irregulieres", label: "Coupe irreguliere" },
  ],
  centrale_vapeur: [
    { value: "vapeur_absente", label: "Vapeur absente" },
    { value: "pression_faible", label: "Pression insuffisante" },
    { value: "fuite_eau", label: "Fuite d'eau" },
  ],
};

export function getMainSymptoms(objectType?: string): SelectOption[] {
  const specific = objectType ? byObjectType[objectType] ?? [] : [];
  return [...specific, ...genericSymptoms, { value: "autre", label: "Autre symptome" }];
}
