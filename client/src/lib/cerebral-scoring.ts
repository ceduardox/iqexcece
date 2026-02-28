export type CerebralAnswer = {
  tema?: string;
  type: string;
  answer: string;
  correct: string;
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

function getCognitiveScore(answers: CerebralAnswer[]): { block: BlockScore; correctCount: number; total: number } {
  let leftScore = 0;
  let rightScore = 0;
  let total = 0;
  let correctCount = 0;

  for (const ans of answers || []) {
    if (!ans?.type) continue;
    total += 1;
    const isCorrect = compareAnswer(ans.answer, ans.correct);
    if (isCorrect) correctCount += 1;

    const type = normalizeText(ans.type);
    const weight = isCorrect ? 1 : 0;
    if (LEFT_COGNITIVE_TYPES.has(type)) {
      leftScore += weight;
    } else if (RIGHT_COGNITIVE_TYPES.has(type)) {
      rightScore += weight;
    } else {
      leftScore += weight * 0.5;
      rightScore += weight * 0.5;
    }
  }

  if (total === 0) return { block: { available: false, leftRatio: 0.5 }, correctCount: 0, total: 0 };

  const sideTotal = leftScore + rightScore;
  const leftRatio = sideTotal > 0 ? leftScore / sideTotal : 0.5;
  return { block: { available: true, leftRatio }, correctCount, total };
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

  return {
    leftPercent,
    rightPercent,
    dominantSide: leftPercent >= rightPercent ? "izquierdo" : "derecho",
    personalityTraits: preferencia.traits,
    correctCount: cognitive.correctCount,
    totalExercises: cognitive.total,
    isPartial: available.length < 3,
  };
}

export function isCerebralAnswerCorrect(answer: CerebralAnswer): boolean {
  return compareAnswer(answer.answer, answer.correct);
}
