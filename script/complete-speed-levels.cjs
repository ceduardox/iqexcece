require("dotenv/config");

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const APPLY = process.argv.includes("--apply");
const DRY_RUN = !APPLY;

const TARGET_SPEEDS = [
  100, 150, 200, 250, 300, 350, 400, 450, 500,
  600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400,
  1500, 1600, 1700, 1800, 1900, 2000, 2200, 2400,
  2600, 2800, 3000,
];

const TARGET_PATTERNS = ["2x2", "2x3", "3x2", "2x4", "3x3"];

const WORD_BANKS = {
  ninos: [
    "gato", "luna", "sol", "casa", "flor", "rio", "juego", "amigo", "cuento", "parque",
    "arbol", "nube", "color", "globo", "musica", "libro", "clase", "dibujo", "sonrisa", "aventura",
    "barco", "plaza", "camino", "estrella", "bosque", "ventana", "zapato", "pelota", "familia", "colegio",
    "lapiz", "mesa", "silla", "pizarra", "tren", "avion", "lluvia", "playa", "montana", "jardin",
  ],
  adolescentes: [
    "proyecto", "analisis", "equipo", "reto", "meta", "resumen", "lectura", "concepto", "debate", "estrategia",
    "sintesis", "practica", "tecnica", "memoria", "enfoque", "prioridad", "proceso", "resultado", "disciplina", "progreso",
    "identidad", "criterio", "dialogo", "energia", "habito", "talento", "creatividad", "objetivo", "decision", "contexto",
    "argumento", "secuencia", "atencion", "logica", "impulso", "destreza", "vision", "metodo", "avance", "desafio",
  ],
  universitarios: [
    "hipotesis", "metodo", "criterio", "modelo", "sistema", "argumento", "inferencia", "evidencia", "variable", "matriz",
    "prototipo", "gestion", "teorema", "iteracion", "simulacion", "validacion", "framework", "riesgo", "escenario", "sintesis",
    "paradigma", "algoritmo", "estructura", "proceso", "analitica", "contexto", "diagnostico", "fundamento", "conceptual", "estrategico",
    "derivada", "integral", "ensayo", "reporte", "fuente", "indice", "grafico", "lectura", "memoria", "cognicion",
  ],
  profesionales: [
    "propuesta", "impacto", "metricas", "eficiencia", "operacion", "negocio", "cliente", "decision", "prioridad", "sinergia",
    "pipeline", "objetivo", "indicador", "consolidado", "ejecucion", "optimizacion", "rentabilidad", "proyeccion", "reporte", "estrategico",
    "liderazgo", "innovacion", "diagnostico", "planeacion", "recurso", "agenda", "gestion", "resultado", "mercado", "calidad",
    "proceso", "producto", "servicio", "alianza", "control", "vision", "analisis", "criterio", "desarrollo", "conversion",
  ],
  adulto_mayor: [
    "recuerdo", "atencion", "lectura", "claridad", "habito", "calma", "enfoque", "comprension", "aprendizaje", "constancia",
    "relacion", "ejercicio", "balance", "dialogo", "familia", "historia", "palabra", "emocion", "proposito", "bienestar",
    "memoria", "ritmo", "salud", "amistad", "camino", "jardin", "musica", "vida", "mente", "orden",
    "energia", "cuidado", "reflexion", "relato", "imagen", "tiempo", "presente", "detalle", "sonrisa", "tranquilidad",
  ],
};

const COMMON_WORDS = [
  "mente", "vision", "ritmo", "pulso", "senal", "foco", "energia", "impulso", "camino", "avance",
  "logro", "orden", "mapa", "clave", "forma", "linea", "punto", "trazo", "figura", "campo",
  "radio", "nucleo", "codigo", "frase", "sonido", "imagen", "detalle", "escena", "lectura", "pagina",
  "texto", "idea", "nota", "dato", "serie", "grupo", "bloque", "marca", "salto", "nivel",
  "base", "union", "valor", "mision", "talento", "control", "destreza", "agilidad", "dominio", "respuesta",
  "atomo", "iglesia", "olvido", "opaco", "origen", "cristal", "brillo", "enlace", "circuito", "horizonte",
  "memoria", "sentido", "calculo", "razon", "patron", "senal", "estimulo", "objetivo", "filtro", "canal",
  "puente", "motor", "vector", "escala", "modulo", "reflejo", "pista", "rumbo", "enfoque", "alerta",
];

const normalizeCategory = (value) => {
  const raw = String(value || "ninos").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (raw.includes("pre") || raw.includes("nino") || raw.includes("niño")) return "ninos";
  if (raw.includes("adolesc")) return "adolescentes";
  if (raw.includes("univers")) return "universitarios";
  if (raw.includes("prof")) return "profesionales";
  if (raw.includes("adult")) return "adulto_mayor";
  return "ninos";
};

const patternSize = (pattern) => {
  const [cols, rows] = String(pattern || "3x2").split("x").map((n) => Number(n));
  return Math.max(4, (Number.isFinite(cols) ? cols : 3) * (Number.isFinite(rows) ? rows : 2));
};

const wordCountFor = (pattern, speed) => {
  const size = patternSize(pattern);
  const tier = speed <= 500 ? 10 : speed <= 1000 ? 14 : speed <= 1700 ? 18 : speed <= 2400 ? 22 : 26;
  let count = Math.max(size + 8, size + tier);
  if (count % size === 0) count += 1;
  return Math.min(60, count);
};

const hashSeed = (text) => {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededShuffle = (items, seedText) => {
  const arr = [...items];
  let seed = hashSeed(seedText) || 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const makeWords = ({ categoria, rowId, pattern, speed }) => {
  const category = normalizeCategory(categoria);
  const pool = Array.from(new Set([...(WORD_BANKS[category] || WORD_BANKS.ninos), ...COMMON_WORDS]));
  const count = wordCountFor(pattern, speed);
  return seededShuffle(pool, `${rowId}:${category}:${pattern}:${speed}`).slice(0, count);
};

const makeOptions = (words, tipoPregunta) => {
  const correct = tipoPregunta === "primera" ? words[0] : words[words.length - 1];
  const distractors = words.filter((w) => w !== correct).slice(0, 7);
  return Array.from(new Set([correct, ...distractors])).slice(0, 8).join(", ");
};

const levelKey = (nivel) => `${String(nivel?.patron || "3x2").trim()}|${Number(nivel?.velocidad) || 0}`;

const sanitizeLevel = (nivel, fallbackIndex) => {
  const palabras = String(
    nivel?.palabras || (Array.isArray(nivel?.contenido) ? nivel.contenido.join(", ") : ""),
  ).trim();

  return {
    nivel: Number(nivel?.nivel) || fallbackIndex + 1,
    patron: String(nivel?.patron || "3x2").trim(),
    velocidad: Number(nivel?.velocidad) || 150,
    palabras,
    opciones: String(nivel?.opciones || "").trim(),
    tipoPregunta: nivel?.tipoPregunta === "primera" ? "primera" : "ultima",
  };
};

async function main() {
  const databaseUrl = process.env.TARGET_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL, DATABASE_PUBLIC_URL o TARGET_DATABASE_URL no esta definido en .env o en el entorno.");
  }

  const sslDisabled =
    databaseUrl.includes("localhost") ||
    databaseUrl.includes("sslmode=disable") ||
    String(process.env.DATABASE_SSL || process.env.PGSSLMODE || "").toLowerCase() === "disable" ||
    String(process.env.DATABASE_SSL || "").toLowerCase() === "false";

  const connect = async (ssl) => {
    const candidate = new Client({ connectionString: databaseUrl, ssl });
    await candidate.connect();
    return candidate;
  };

  let client;
  try {
    client = await connect(sslDisabled ? false : { rejectUnauthorized: false });
  } catch (error) {
    if (!sslDisabled && ["ECONNRESET", "EPROTO"].includes(error.code)) {
      client = await connect(false);
    } else {
      throw error;
    }
  }

  const { rows } = await client.query(`
    select
      ve.id,
      ve.entrenamiento_item_id,
      ve.niveles,
      ve.titulo,
      ei.categoria,
      ei.title as item_title
    from velocidad_ejercicios ve
    left join entrenamiento_items ei on ei.id = ve.entrenamiento_item_id
    order by coalesce(ei.categoria, ''), coalesce(ei.sort_order, 0), ve.created_at nulls last
  `);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), ".codex-backups");
  const backupPath = path.join(backupDir, `velocidad-niveles-${stamp}.json`);
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(rows.map((row) => ({
    id: row.id,
    entrenamientoItemId: row.entrenamiento_item_id,
    titulo: row.titulo,
    categoria: row.categoria,
    itemTitle: row.item_title,
    niveles: row.niveles,
  })), null, 2));

  let updatedRows = 0;
  let skippedRows = 0;
  let preservedLevels = 0;
  let addedLevels = 0;
  const perRow = [];

  for (const row of rows) {
    let parsed;
    try {
      parsed = JSON.parse(row.niveles || "[]");
      if (!Array.isArray(parsed)) throw new Error("niveles no es un array");
    } catch (error) {
      skippedRows += 1;
      perRow.push({ id: row.id, title: row.item_title || row.titulo, skipped: true, reason: error.message });
      continue;
    }

    const existing = parsed.map((nivel, index) => sanitizeLevel(nivel, index));
    const byKey = new Map(existing.map((nivel) => [levelKey(nivel), nivel]));
    const next = [...existing];
    const initialCount = next.length;
    preservedLevels += initialCount;

    for (const pattern of TARGET_PATTERNS) {
      TARGET_SPEEDS.forEach((speed, speedIndex) => {
        const key = `${pattern}|${speed}`;
        if (byKey.has(key)) return;
        const words = makeWords({ categoria: row.categoria, rowId: row.id, pattern, speed });
        const tipoPregunta = (speedIndex + TARGET_PATTERNS.indexOf(pattern)) % 2 === 0 ? "ultima" : "primera";
        const newLevel = {
          nivel: next.length + 1,
          patron: pattern,
          velocidad: speed,
          palabras: words.join(", "),
          opciones: makeOptions(words, tipoPregunta),
          tipoPregunta,
        };
        next.push(newLevel);
        byKey.set(key, newLevel);
      });
    }

    const rowAdded = next.length - initialCount;
    if (rowAdded > 0) {
      addedLevels += rowAdded;
      updatedRows += 1;
      if (APPLY) {
        await client.query(
          "update velocidad_ejercicios set niveles = $1, updated_at = now() where id = $2",
          [JSON.stringify(next), row.id],
        );
      }
    }

    perRow.push({
      id: row.id,
      title: row.item_title || row.titulo,
      categoria: row.categoria || "sin-categoria",
      existing: initialCount,
      added: rowAdded,
      total: next.length,
    });
  }

  await client.end();

  console.log(JSON.stringify({
    mode: DRY_RUN ? "dry-run" : "apply",
    rows: rows.length,
    updatedRows,
    skippedRows,
    preservedLevels,
    addedLevels,
    targetSpeeds: TARGET_SPEEDS,
    targetPatterns: TARGET_PATTERNS,
    backupPath,
    perRow,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
