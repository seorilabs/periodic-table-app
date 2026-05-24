import { trackClick as trackCoreClick } from "@seorilabs/ait-core";

import type { ElementInfo } from "./data/elements";

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

export function trackQuizCompleted(params: { score: number; total: number }) {
  logClick("quiz_completed", {
    score: params.score,
    total: params.total,
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
