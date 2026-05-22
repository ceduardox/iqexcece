import { storage } from "./storage";

const recoveredInstituciones = [
  { nombre: "ADVENTISTA SANTA CRUZ", pais: "BO", estado: "Santa Cruz", tipo: "colegio" },
  { nombre: "LAS PALMAS SCHOOL", pais: "BO", estado: "Santa Cruz", tipo: "colegio" },
  { nombre: "BAUTISTA BOLIVIANO BRASILE\u00d1O", pais: "BO", estado: "Santa Cruz", tipo: "colegio" },
  { nombre: "BEREA", pais: "BO", estado: "Santa Cruz", tipo: "colegio" },
  { nombre: "R\u00cdO NUEVO", pais: "BO", estado: "Santa Cruz", tipo: "colegio" },
  { nombre: "AMADEUS MOZART", pais: "BO", estado: "Santa Cruz", tipo: "colegio" },
  { nombre: "SANTO TOMAS DE AQUINO", pais: "BO", estado: "Santa Cruz", tipo: "colegio" },
  { nombre: "MARIA GORETTI", pais: "BO", estado: "Santa Cruz", tipo: "colegio" },
  { nombre: "CARDENAL CUSHING", pais: "BO", estado: "Santa Cruz", tipo: "colegio" },
  { nombre: "BRITISH BOLIVIAN SCHOOL", pais: "BO", estado: "Santa Cruz", tipo: "colegio" },
  { nombre: "TEACH MONT", pais: "BO", estado: "Santa Cruz", tipo: "colegio" },
];

function institutionKey(inst: { nombre: string; pais: string; estado: string; tipo?: string | null }) {
  return [
    inst.nombre.trim().toLocaleUpperCase("es-BO"),
    inst.pais.trim().toLocaleUpperCase("es-BO"),
    inst.estado.trim().toLocaleUpperCase("es-BO"),
    (inst.tipo || "colegio").trim().toLocaleUpperCase("es-BO"),
  ].join("|");
}

export async function ensureRecoveredInstituciones(log: (message: string, source?: string) => void) {
  try {
    const existing = await storage.getInstituciones("BO", "Santa Cruz", "colegio");
    const existingKeys = new Set(existing.map(institutionKey));
    const missing = recoveredInstituciones.filter((inst) => !existingKeys.has(institutionKey(inst)));

    for (const inst of missing) {
      await storage.saveInstitucion(inst);
    }

    if (missing.length > 0) {
      log(`instituciones recuperadas insertadas: ${missing.length}`, "seed");
    }
  } catch (error) {
    log(`no se pudo verificar instituciones recuperadas: ${(error as Error).message}`, "seed");
  }
}
