export type CerebralAnswer = {
  tema?: string;
  type: string;
  answer: string;
  correct: string;
  dimension?: "lateralidad" | "logico_secuencial" | "visoespacial" | "memoria_trabajo" | "inhibicion";
  targetHemisphere?: "left" | "right" | "balanced";
  weight?: number;
  scoringMode?: "accuracy" | "accuracy_time" | "consistency";
  maxTimeSec?: number;
  timeTakenMs?: number;
  traitTag?: string;
};

export type PreferenciaAnswer = {
  tema?: string;
  imageUrl?: string;
  meaning: string;
};

type Side = "left" | "right" | null;

const LEFT_KEYWORDS = ["izquierda", "left", "esquerda", "izq"];
const RIGHT_KEYWORDS = ["derecha", "right", "direita", "der"];

const LEFT_TRAIT_HINTS = ["regla", "estrateg", "detalle", "racional", "idioma", "logica"];
const RIGHT_TRAIT_HINTS = ["imagen", "caos", "creativ", "intuic", "fantas", "curios"];

const LEFT_COGNITIVE_TYPES = new Set(["secuencia", "stroop", "patron"]);
const RIGHT_COGNITIVE_TYPES = new Set(["memoria", "bailarina"]);

function normalizeText(value: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function classifySide(value: string): Side {
  const text = normalizeText(value);
  if (!text) return null;
  if (LEFT_KEYWORDS.some((k) => text.includes(k))) return "left";
  if (RIGHT_KEYWORDS.some((k) => text.includes(k))) return "right";
  return null;
}

function compareAnswer(answer: string, correct: string): boolean {
  const a = normalizeText(answer);
  const c = normalizeText(correct);

  if (!a || !c) return false;

  // Multi-select / list answers (e.g., memoria)
  if (a.includes(",") || c.includes(",")) {
    const aSet = new Set(a.split(",").map((v) => v.trim()).filter(Boolean));
    const cSet = new Set(c.split(",").map((v) => v.trim()).filter(Boolean));
    if (aSet.size !== cSet.size) return false;
    return Array.from(aSet).every((item) => cSet.has(item));
  }

  return a === c;
}

function getSafeWeight(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 1;
  if (value < 0.1) return 0.1;
  if (value > 3) return 3;
  return value;
}

function inferHemisphereByType(typeValue: string): "left" | "right" | "balanced" {
  const type = normalizeText(typeValue);
  if (LEFT_COGNITIVE_TYPES.has(type)) return "left";
  if (RIGHT_COGNITIVE_TYPES.has(type)) return "right";
  return "balanced";
}

function getAnswerRawScore(answer: CerebralAnswer): number {
  const correct = compareAnswer(answer.answer, answer.correct);
  if (!correct) return 0;

  const mode = answer.scoringMode || "accuracy";
  if (mode === "accuracy_time") {
    const maxMs = Math.max((answer.maxTimeSec || 30) * 1000, 1000);
    const spentMs = Math.max(answer.timeTakenMs || maxMs, 0);
    const ratio = Math.max(0, Math.min(1, spentMs / maxMs));
    const speedBonus = 1 - ratio * 0.5; // 1.0 fast, 0.5 at limit
    return Math.max(0.5, speedBonus);
  }

  // "consistency" uses accuracy fallback for now (future: cross-item consistency)
  return 1;
}

type ProfileInput = {
  lateralidadAnswers: string[];
  preferenciaAnswers: PreferenciaAnswer[];
  cerebralAnswers: CerebralAnswer[];
};

type BlockScore = {
  available: boolean;
  leftRatio: number;
};

export type CerebralProfile = {
  leftPercent: number;
  rightPercent: number;
  dominantSide: "izquierdo" | "derecho";
  personalityTraits: string[];
  correctCount: number;
  totalExercises: number;
  isPartial: boolean;
};

function getLateralidadScore(answers: string[]): BlockScore {
  let left = 0;
  let right = 0;
  for (const ans of answers || []) {
    const side = classifySide(ans);
    if (side === "left") left += 1;
    if (side === "right") right += 1;
  }
  const total = left + right;
  if (total === 0) return { available: false, leftRatio: 0.5 };
  return { available: true, leftRatio: left / total };
}

function getCognitiveScore(answers: CerebralAnswer[]): { block: BlockScore; correctCount: number; total: number; traitTags: string[] } {
  let leftScore = 0;
  let rightScore = 0;
  let total = 0;
  let correctCount = 0;
  const traitTags: string[] = [];

  for (const ans of answers || []) {
    if (!ans?.type) continue;
    total += 1;
    const isCorrect = compareAnswer(ans.answer, ans.correct);
    if (isCorrect) correctCount += 1;

    const hemisphere = ans.targetHemisphere || inferHemisphereByType(ans.type);
    const weightedScore = getAnswerRawScore(ans) * getSafeWeight(ans.weight);

    if (hemisphere === "left") leftScore += weightedScore;
    else if (hemisphere === "right") rightScore += weightedScore;
    else {
      leftScore += weightedScore * 0.5;
      rightScore += weightedScore * 0.5;
    }

    if (isCorrect && ans.traitTag && ans.traitTag.trim()) {
      traitTags.push(ans.traitTag.trim());
    }
  }

  if (total === 0) return { block: { available: false, leftRatio: 0.5 }, correctCount: 0, total: 0, traitTags: [] };

  const sideTotal = leftScore + rightScore;
  const leftRatio = sideTotal > 0 ? leftScore / sideTotal : 0.5;
  return { block: { available: true, leftRatio }, correctCount, total, traitTags };
}

function getPreferenciaScore(answers: PreferenciaAnswer[]): { block: BlockScore; traits: string[] } {
  const traits = (answers || []).map((a) => a?.meaning || "").filter(Boolean);
  if (traits.length === 0) return { block: { available: false, leftRatio: 0.5 }, traits: [] };

  let leftHits = 0;
  let rightHits = 0;
  for (const trait of traits) {
    const text = normalizeText(trait);
    if (LEFT_TRAIT_HINTS.some((k) => text.includes(k))) leftHits += 1;
    if (RIGHT_TRAIT_HINTS.some((k) => text.includes(k))) rightHits += 1;
  }

  const totalHits = leftHits + rightHits;
  const leftRatio = totalHits > 0 ? leftHits / totalHits : 0.5;
  const uniqueTraits = Array.from(new Set(traits.map((t) => t.trim()).filter(Boolean)));
  return { block: { available: true, leftRatio }, traits: uniqueTraits };
}

export function computeCerebralProfile(input: ProfileInput): CerebralProfile {
  const lateralidad = getLateralidadScore(input.lateralidadAnswers || []);
  const cognitive = getCognitiveScore(input.cerebralAnswers || []);
  const preferencia = getPreferenciaScore(input.preferenciaAnswers || []);

  const baseWeights: Array<{ block: BlockScore; weight: number }> = [
    { block: lateralidad, weight: 0.45 },
    { block: cognitive.block, weight: 0.35 },
    { block: preferencia.block, weight: 0.2 },
  ];

  const available = baseWeights.filter((b) => b.block.available);
  const totalWeight = available.reduce((sum, b) => sum + b.weight, 0);

  // Safe fallback: neutral profile
  let leftRatio = 0.5;
  if (totalWeight > 0) {
    leftRatio =
      available.reduce((sum, b) => sum + b.block.leftRatio * (b.weight / totalWeight), 0);
  }

  const leftPercent = Math.round(leftRatio * 100);
  const rightPercent = 100 - leftPercent;
  const mergedTraits = Array.from(new Set([...preferencia.traits, ...cognitive.traitTags]));

  return {
    leftPercent,
    rightPercent,
    dominantSide: leftPercent >= rightPercent ? "izquierdo" : "derecho",
    personalityTraits: mergedTraits,
    correctCount: cognitive.correctCount,
    totalExercises: cognitive.total,
    isPartial: available.length < 3,
  };
}

export function isCerebralAnswerCorrect(answer: CerebralAnswer): boolean {
  return compareAnswer(answer.answer, answer.correct);
}
