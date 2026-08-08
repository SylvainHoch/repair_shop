import type { ApplianceType, ObjectFamily, SelectOption } from "../types";
import { objectFamilyValues } from "../types";

type CatalogEntry = {
  family: ObjectFamily;
  value: string;
  label: string;
};

const familyLabels: Record<ObjectFamily, string> = {
  cuisine: "Cuisine",
  entretien: "Maison et entretien",
  bricolage: "Bricolage",
  confort: "Confort et beauté",
  audio_video: "Audio et vidéo",
  telephonie: "Téléphonie et mobile",
  loisirs: "Loisirs et jeux",
  photo_musique: "Photo et musique",
  objets_non_electriques: "Objets non électriques",
};

const categoryCatalog: Record<string, CatalogEntry> = {
  "Unpowered - Household": {
    family: "objets_non_electriques",
    value: "objet_maison_non_electrique",
    label: "Objet de maison non électrique",
  },
  Vacuum: { family: "entretien", value: "aspirateur", label: "Aspirateur" },
  Lamp: { family: "entretien", value: "lampe", label: "Lampe" },
  "Power tool": { family: "bricolage", value: "outil_electrique", label: "Outil électrique" },
  "Hi-Fi separates": { family: "audio_video", value: "elements_hifi", label: "Éléments hi-fi séparés" },
  "Coffee maker": { family: "cuisine", value: "cafetiere", label: "Cafetière" },
  Microwave: { family: "cuisine", value: "micro_ondes", label: "Micro-ondes" },
  "Unpowered - Other": {
    family: "objets_non_electriques",
    value: "objet_non_electrique_autre",
    label: "Autre objet non électrique",
  },
  "Small home electrical": {
    family: "entretien",
    value: "petit_appareil_maison",
    label: "Petit appareil électrique de maison",
  },
  "Food processor": { family: "cuisine", value: "robot_cuisine", label: "Robot de cuisine" },
  "Small kitchen item": { family: "cuisine", value: "petit_appareil_cuisine", label: "Petit appareil de cuisine" },
  "Portable radio": { family: "audio_video", value: "radio_portable", label: "Radio portable" },
  "Watch/clock": { family: "entretien", value: "horloge_reveil", label: "Horloge / réveil" },
  "Large home electrical": {
    family: "entretien",
    value: "gros_appareil_maison",
    label: "Gros appareil électrique de maison",
  },
  Toaster: { family: "cuisine", value: "grille_pain", label: "Grille-pain" },
  "Decorative or safety lights": {
    family: "entretien",
    value: "eclairage_decoratif",
    label: "Éclairage décoratif ou de sécurité",
  },
  Iron: { family: "entretien", value: "fer_a_repasser", label: "Fer à repasser" },
  Kettle: { family: "cuisine", value: "bouilloire", label: "Bouilloire" },
  Toy: { family: "loisirs", value: "jouet", label: "Jouet" },
  "Hair & beauty item": { family: "confort", value: "appareil_beaute", label: "Appareil de beauté" },
  "TV and gaming-related accessories": {
    family: "audio_video",
    value: "accessoire_tv_jeu_video",
    label: "Accessoire TV ou jeu vidéo",
  },
  "Battery/charger/adapter": {
    family: "telephonie",
    value: "batterie_chargeur_adaptateur",
    label: "Batterie / chargeur / adaptateur",
  },
  Mobile: { family: "telephonie", value: "telephone_mobile", label: "Smartphone / téléphone mobile" },
  Computer: { family: "telephonie", value: "ordinateur_pc", label: "Ordinateur / PC" },
  "Hi-Fi integrated": { family: "audio_video", value: "chaine_hifi", label: "Chaîne hi-fi intégrée" },
  "Flat screen": { family: "audio_video", value: "ecran_plat", label: "Écran plat / téléviseur" },
  Tablet: { family: "telephonie", value: "tablette", label: "Tablette" },
  Headphones: { family: "audio_video", value: "casque_audio", label: "Casque audio" },
  "Hair dryer": { family: "confort", value: "seche_cheveux", label: "Seche-cheveux" },
  Fan: { family: "confort", value: "ventilateur", label: "Ventilateur" },
  "Handheld entertainment device": { family: "loisirs", value: "console_portable", label: "Console portable" },
  "Paper shredder": { family: "entretien", value: "destructeur_documents", label: "Destructeur de documents" },
  "Aircon/dehumidifier": {
    family: "confort",
    value: "climatiseur_deshumidificateur",
    label: "Climatiseur / déshumidificateur",
  },
  "Digital compact camera": { family: "photo_musique", value: "appareil_photo_compact", label: "Appareil photo compact" },
  Projector: { family: "photo_musique", value: "projecteur", label: "Projecteur" },
  "Musical instrument": { family: "photo_musique", value: "instrument_musique", label: "Instrument de musique" },
  "Games console": { family: "loisirs", value: "console_jeux", label: "Console de jeux" },
  "DSLR/video camera": { family: "photo_musique", value: "reflex_camera", label: "Reflex / caméra vidéo" },
};

const includedCategories = [
  "Unpowered - Household",
  "Vacuum",
  "Lamp",
  "Power tool",
  "Hi-Fi separates",
  "Coffee maker",
  "Microwave",
  "Unpowered - Other",
  "Small home electrical",
  "Food processor",
  "Small kitchen item",
  "Portable radio",
  "Watch/clock",
  "Large home electrical",
  "Toaster",
  "Decorative or safety lights",
  "Iron",
  "Kettle",
  "Toy",
  "Hair & beauty item",
  "TV and gaming-related accessories",
  "Battery/charger/adapter",
  "Mobile",
  "Computer",
  "Hi-Fi integrated",
  "Flat screen",
  "Tablet",
  "Headphones",
  "Hair dryer",
  "Fan",
  "Handheld entertainment device",
  "Paper shredder",
  "Aircon/dehumidifier",
  "Digital compact camera",
  "Projector",
  "Musical instrument",
  "Games console",
  "DSLR/video camera",
] as const;

export const applianceTypes: ApplianceType[] = includedCategories.map((category) => categoryCatalog[category]);

export const objectFamilies: SelectOption[] = objectFamilyValues
  .filter((family) => applianceTypes.some((item) => item.family === family))
  .map((family) => ({ value: family, label: familyLabels[family] }));

export function getObjectTypesForFamily(family?: ObjectFamily): SelectOption[] {
  if (!family) return [];
  return [
    ...applianceTypes
    .filter((item) => item.family === family)
    .map((item) => ({ value: item.value, label: item.label })),
    { value: "autre", label: "Autre (non liste)" },
  ];
}
