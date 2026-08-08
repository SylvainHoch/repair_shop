export const systematicallyRefusedObjectTypes = [
  "micro_ondes",
  "ecran_plat",
  "ordinateur_pc",
  "telephone_mobile",
  "gros_appareil_maison",
] as const;

export const systematicallyRefusedObjectLabels: Record<(typeof systematicallyRefusedObjectTypes)[number], string> = {
  micro_ondes: "Micro-ondes",
  ecran_plat: "Télévision",
  ordinateur_pc: "Ordinateur / PC",
  telephone_mobile: "Smartphone",
  gros_appareil_maison: "Gros électroménager",
};

export function isSystematicallyRefusedObjectType(value?: string): boolean {
  return systematicallyRefusedObjectTypes.includes(value as (typeof systematicallyRefusedObjectTypes)[number]);
}
