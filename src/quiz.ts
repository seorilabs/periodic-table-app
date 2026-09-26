import { ELEMENTS } from "./data/elements";
import type { ElementCategoryKey, ElementInfo } from "./data/elements";

export type QuizDifficulty = "easy" | "normal" | "hard";

export type QuizQuestionType =
  | "symbol-to-name"
  | "number-to-name"
  | "name-to-symbol"
  | "year-to-name";

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  element: ElementInfo;
  options: ElementInfo[];
  prompt: string;
}

export interface QuizRoundConfig {
  difficulty: QuizDifficulty;
  questionCount: number;
  optionCount: number;
  questionTypes: QuizQuestionType[];
}

export interface QuizAnswer {
  questionId: string;
  selectedSymbol: string;
  correct: boolean;
  difficulty: QuizDifficulty;
  type: QuizQuestionType;
}

export interface DifficultyPreset {
  difficulty: QuizDifficulty;
  questionCount: number;
  optionCount: number;
  typeRotation: QuizQuestionType[];
  distractorStrategy: DistractorStrategy;
}

export type DistractorStrategy =
  | "any"
  | "same-category"
  | "same-category-and-period";

export const DIFFICULTY_PRESETS: Record<QuizDifficulty, DifficultyPreset> = {
  easy: {
    difficulty: "easy",
    questionCount: 5,
    optionCount: 4,
    typeRotation: ["symbol-to-name"],
    distractorStrategy: "any",
  },
  normal: {
    difficulty: "normal",
    questionCount: 8,
    optionCount: 4,
    typeRotation: [
      "symbol-to-name",
      "number-to-name",
      "name-to-symbol",
      "year-to-name",
    ],
    distractorStrategy: "same-category",
  },
  hard: {
    difficulty: "hard",
    questionCount: 10,
    optionCount: 6,
    typeRotation: [
      "symbol-to-name",
      "symbol-to-name",
      "number-to-name",
      "number-to-name",
      "name-to-symbol",
      "name-to-symbol",
      "year-to-name",
      "year-to-name",
      "symbol-to-name",
      "number-to-name",
    ],
    distractorStrategy: "same-category-and-period",
  },
};

export const DIFFICULTY_LABELS: Record<
  QuizDifficulty,
  { label: string; description: string }
> = {
  easy: {
    label: "쉬움",
    description: "기호 → 이름 5문항, 4지선다",
  },
  normal: {
    label: "보통",
    description: "4가지 문항 균등 8문제, 같은 계열에서 오답",
  },
  hard: {
    label: "어려움",
    description: "10문제 6지선다, 같은 계열·주기에서 오답",
  },
};

export function buildQuizRound(difficulty: QuizDifficulty): QuizQuestion[] {
  const preset = DIFFICULTY_PRESETS[difficulty];
  const elements = pickRandomElements(ELEMENTS, preset.questionCount);
  const shuffledTypes = shuffle(preset.typeRotation);

  return elements.map((element, index) => {
    const type = shuffledTypes[index % shuffledTypes.length];
    return buildQuizQuestion(element, type, preset);
  });
}

function buildQuizQuestion(
  element: ElementInfo,
  type: QuizQuestionType,
  preset: DifficultyPreset,
): QuizQuestion {
  const options = buildQuizOptions(element, preset);

  return {
    id: `q-${element.symbol}-${type}`,
    type,
    element,
    options,
    prompt: buildQuizPrompt(element, type),
  };
}

function buildQuizOptions(
  target: ElementInfo,
  preset: DifficultyPreset,
): ElementInfo[] {
  const distractors = pickDistractors(
    target,
    preset.optionCount - 1,
    preset.distractorStrategy,
  );

  return shuffleElements([target, ...distractors]);
}

function pickDistractors(
  target: ElementInfo,
  count: number,
  strategy: DistractorStrategy,
): ElementInfo[] {
  const pool = ELEMENTS.filter(
    (candidate) =>
      candidate.symbol !== target.symbol && matchesDistractorStrategy(candidate, target, strategy),
  );

  const sorted = strategy === "same-category-and-period"
    ? [...pool].sort((a, b) => {
        const periodDeltaA = Math.abs(a.period - target.period);
        const periodDeltaB = Math.abs(b.period - target.period);
        if (periodDeltaA !== periodDeltaB) {
          return periodDeltaA - periodDeltaB;
        }
        return (
          Math.abs(a.atomicNumber - target.atomicNumber) -
          Math.abs(b.atomicNumber - target.atomicNumber)
        );
      })
    : pool;

  return pickRandomElements(sorted, count);
}

function matchesDistractorStrategy(
  candidate: ElementInfo,
  target: ElementInfo,
  strategy: DistractorStrategy,
): boolean {
  if (strategy === "any") {
    return true;
  }

  if (candidate.category !== target.category) {
    return false;
  }

  if (strategy === "same-category-and-period") {
    return Math.abs(candidate.period - target.period) <= 1;
  }

  return true;
}

function buildQuizPrompt(element: ElementInfo, type: QuizQuestionType): string {
  switch (type) {
    case "symbol-to-name":
      return `${element.symbol}는 어떤 원소일까요?`;
    case "number-to-name":
      return `원자번호 ${element.atomicNumber}번은 어떤 원소일까요?`;
    case "name-to-symbol":
      return `${element.nameKo}의 기호는 무엇일까요?`;
    case "year-to-name":
      return `${formatDiscoveryYear(element)}에 발견된 원소는?`;
  }
}

export function formatQuizOptionLabel(
  question: QuizQuestion,
  option: ElementInfo,
): string {
  switch (question.type) {
    case "name-to-symbol":
      return option.symbol;
    default:
      return option.nameKo;
  }
}

export function getQuizOptionMeta(
  question: QuizQuestion,
  option: ElementInfo,
): string {
  switch (question.type) {
    case "name-to-symbol":
      return option.nameKo;
    case "year-to-name":
      return `${option.period}주기 · ${CATEGORY_LABELS[option.category]}`;
    default:
      return CATEGORY_LABELS[option.category];
  }
}

function formatDiscoveryYear(element: ElementInfo): string {
  if (element.yearDiscovered == null) {
    return "발견 연도 미상";
  }
  if (element.yearDiscovered === "Ancient") {
    return "고대부터";
  }
  return `${element.yearDiscovered}년`;
}

const CATEGORY_LABELS: Record<ElementCategoryKey, string> = {
  "nonmetal": "비금속",
  "noble-gas": "비활성 기체",
  "alkali-metal": "알칼리 금속",
  "alkaline-earth-metal": "알칼리 토금속",
  "metalloid": "준금속",
  "halogen": "할로젠",
  "post-transition-metal": "전이후 금속",
  "transition-metal": "전이 금속",
  "lanthanide": "란타넘족",
  "actinide": "악티늄족",
};

function pickRandomElements(
  elements: readonly ElementInfo[],
  count: number,
): ElementInfo[] {
  const pool = [...elements];
  const selected: ElementInfo[] = [];

  while (selected.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    const [element] = pool.splice(index, 1);
    if (element != null) {
      selected.push(element);
    }
  }

  return selected;
}

function shuffleElements(elements: readonly ElementInfo[]): ElementInfo[] {
  return pickRandomElements(elements, elements.length);
}

function shuffle<T>(items: readonly T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}
