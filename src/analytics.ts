import { trackClick as trackCoreClick } from "@seorilabs/ait-core";

import type { ElementInfo } from "./data/elements";
import type { QuizDifficulty, QuizQuestionType } from "./quiz";

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsParams = Record<string, AnalyticsValue>;

const PREFIX = "periodic_table";

export function trackElementOpen(params: {
  element: ElementInfo;
  source: string;
}) {
  logClick("element_open", {
    atomic_number: params.element.atomicNumber,
    symbol: params.element.symbol,
    category: params.element.category,
    source: params.source,
  });
}

export function trackSearchSubmit(params: {
  query: string;
  resultCount: number;
}) {
  logClick("search_submit", {
    query_type: classifyQuery(params.query),
    result_count: params.resultCount,
  });
}

export function trackQuizDifficultySelected(params: {
  difficulty: QuizDifficulty;
}) {
  logClick("quiz_difficulty_selected", {
    difficulty: params.difficulty,
  });
}

export function trackQuizCompleted(params: {
  score: number;
  total: number;
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
}) {
  logClick("quiz_completed", {
    score: params.score,
    total: params.total,
    difficulty: params.difficulty,
    question_type_count: params.questionTypes.length,
    question_types: params.questionTypes.join(","),
  });
}

export function trackAdImpression(params: {
  placement: string;
  adGroupId: string;
}) {
  logClick("ad_impression", {
    placement: params.placement,
    ad_group_id: params.adGroupId,
  });
}

function classifyQuery(query: string): string {
  const trimmed = query.trim();

  if (/^\d+$/u.test(trimmed)) {
    return "atomic_number";
  }

  if (/^[A-Za-z]{1,2}$/u.test(trimmed)) {
    return "symbol";
  }

  return "name";
}

function logClick(name: string, params: AnalyticsParams) {
  trackCoreClick(`${PREFIX}_${name}`, params);
}
