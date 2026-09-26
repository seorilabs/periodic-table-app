export type Mode =
  | "explore"
  | "quiz-difficulty"
  | "quiz"
  | "quiz-result";

const MODE_STACK: Record<Mode, Mode | null> = {
  explore: null,
  "quiz-difficulty": "explore",
  quiz: "quiz-difficulty",
  "quiz-result": "explore",
};

const MODES_REQUIRING_CONFIRM: ReadonlySet<Mode> = new Set<Mode>(["quiz"]);

export function previousModeFor(current: Mode): Mode | null {
  return MODE_STACK[current];
}

export function modeRequiresBackConfirm(current: Mode): boolean {
  return MODES_REQUIRING_CONFIRM.has(current);
}

export const BACK_NAV_STATE_KEY = "periodic-table:mode";

export function pushModeState(current: Mode): void {
  if (typeof window === "undefined" || !window.history?.pushState) {
    return;
  }
  try {
    window.history.pushState({ [BACK_NAV_STATE_KEY]: current }, "");
  } catch {
    // 일부 임베디드 환경(아이프레임 샌드박스 등)에서 pushState가 실패할 수 있음.
    // 백버튼 처리는 그대로 동작해야 하므로 조용히 무시한다.
  }
}

export function clearModeState(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.history.replaceState(
      { [BACK_NAV_STATE_KEY]: "explore" },
      "",
    );
  } catch {
    // 위와 동일.
  }
}
