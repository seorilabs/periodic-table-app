import { getStorageItem, setStorageItem } from "@seorilabs/ait-core";
import { Badge, Button, ProgressBar, TextField, Top } from "@toss/tds-mobile";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import {
  CATEGORY_META,
  DATA_SOURCE,
  ELEMENTS,
  ELEMENTS_BY_NUMBER,
  ELEMENTS_BY_SYMBOL,
  KOREAN_NAME_SOURCE,
} from "./data/elements";
import type { ElementCategoryKey, ElementInfo } from "./data/elements";
import {
  trackElementOpen,
  trackQuizCompleted,
  trackSearchSubmit,
} from "./analytics";

type Mode = "explore" | "quiz" | "quiz-result";
type CategoryFilter = ElementCategoryKey | "all";

interface QuizQuestion {
  id: string;
  element: ElementInfo;
  options: ElementInfo[];
}

interface QuizAnswer {
  questionId: string;
  selectedSymbol: string;
  correct: boolean;
}

const APP_META = {
  displayName: "원소 주기율표",
};
const RECENT_ELEMENT_KEY = "periodic-table:last-element";
const DEFAULT_ELEMENT = mustGetElement(8);
const GRID_ROWS = Array.from({ length: 10 }, (_, index) => index + 1);
const GRID_COLUMNS = Array.from({ length: 18 }, (_, index) => index + 1);
const QUIZ_QUESTION_COUNT = 5;
const QUIZ_OPTION_COUNT = 4;
const CATEGORY_STORY_LINES: Record<ElementCategoryKey, string> = {
  nonmetal:
    "비금속 계열이라 금속처럼 다루기보다 생명, 대기, 광물 속에서 다양한 모습으로 등장해요.",
  "noble-gas":
    "비활성 기체 계열이라 다른 원소와 쉽게 엮이지 않는 조용한 성격으로 알려져 있어요.",
  "alkali-metal":
    "알칼리 금속 계열이라 반응성이 큰 편이라서 실험실에서는 조심히 다뤄야 해요.",
  "alkaline-earth-metal":
    "알칼리 토금속 계열이라 광물과 뼈, 암석 같은 단단한 물질 이야기와 자주 이어져요.",
  metalloid:
    "준금속이라 금속과 비금속 사이의 성질을 오가며 반도체와 재료 이야기에서 자주 등장해요.",
  halogen:
    "할로젠 계열이라 염을 만드는 반응과 소독, 조명, 사진 같은 생활 속 장면과도 이어져요.",
  "post-transition-metal":
    "전이후 금속이라 비교적 무르고 낮은 녹는점 같은 특징으로 재료 이야기에서 개성이 드러나요.",
  "transition-metal":
    "전이 금속 계열이라 색, 자성, 합금, 촉매처럼 눈에 보이는 화학 변화의 주역이 되기 쉬워요.",
  lanthanide:
    "란타넘족이라 강한 빛과 자석, 정밀 부품에 쓰이는 희토류 이야기와 자주 연결돼요.",
  actinide:
    "악티늄족이라 방사성, 원자력, 인공 원소 연구처럼 현대 과학사의 굵직한 장면과 이어져요.",
};

function App() {
  const [initialPath] = useState(() => window.location.pathname);
  const [initialElement] = useState(() => getInitialElementFromUrl());
  const [mode, setMode] = useState<Mode>(() =>
    initialPath.includes("/quiz") ? "quiz" : "explore",
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedElement, setSelectedElement] = useState<ElementInfo>(
    initialElement ?? DEFAULT_ELEMENT,
  );
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() =>
    buildQuizRound(),
  );
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);

  useEffect(() => {
    if (initialElement != null) {
      trackElementOpen({ element: initialElement, source: "url" });
      scrollToElementDetail();
      return;
    }

    if (initialPath.includes("/elements")) {
      scrollToElementDetail();
    }

    void getStorageItem(RECENT_ELEMENT_KEY).then((symbol) => {
      const recentElement =
        symbol == null ? null : ELEMENTS_BY_SYMBOL.get(symbol.toUpperCase());
      if (recentElement != null) {
        setSelectedElement(recentElement);
      }
    });
  }, [initialElement, initialPath]);

  const filteredElements = useMemo(
    () =>
      ELEMENTS.filter(
        (element) =>
          matchesCategory(element, categoryFilter) &&
          matchesQuery(element, query),
      ),
    [categoryFilter, query],
  );
  const selectedElementStory = useMemo(
    () => buildElementStory(selectedElement),
    [selectedElement],
  );

  const selectedCategoryMeta = CATEGORY_META[selectedElement.category];
  const currentQuizQuestion = quizQuestions[quizIndex];
  const quizScore = quizAnswers.filter((answer) => answer.correct).length;

  const selectElement = (element: ElementInfo, source: string) => {
    setSelectedElement(element);
    setMode("explore");
    trackElementOpen({ element, source });
    void setStorageItem(RECENT_ELEMENT_KEY, element.symbol);
    scrollToElementDetail();
  };

  const submitSearch = () => {
    trackSearchSubmit({
      query,
      resultCount: filteredElements.length,
    });
    if (filteredElements[0] != null) {
      selectElement(filteredElements[0], "search");
    }
  };

  const startQuiz = () => {
    setQuizQuestions(buildQuizRound());
    setMode("quiz");
    setQuizIndex(0);
    setQuizAnswers([]);
    scrollToTop();
  };

  const answerQuiz = (symbol: string) => {
    const answer: QuizAnswer = {
      questionId: currentQuizQuestion.id,
      selectedSymbol: symbol,
      correct: symbol === currentQuizQuestion.element.symbol,
    };
    const nextAnswers = [...quizAnswers, answer];
    setQuizAnswers(nextAnswers);

    if (quizIndex === quizQuestions.length - 1) {
      const nextScore = nextAnswers.filter((item) => item.correct).length;
      trackQuizCompleted({ score: nextScore, total: quizQuestions.length });
      setMode("quiz-result");
      scrollToTop();
      return;
    }

    setQuizIndex((current) => current + 1);
    scrollToTop();
  };

  if (mode === "quiz") {
    return (
      <main className="app-screen">
        <section className="progress-section">
          <span>
            {quizIndex + 1} / {quizQuestions.length}
          </span>
          <ProgressBar
            animate
            color="#1F8A70"
            progress={(quizIndex + 1) / quizQuestions.length}
            size="bold"
          />
        </section>

        <Top
          lowerGap={12}
          title={
            <Top.TitleParagraph size={22}>
              {currentQuizQuestion.element.symbol}는 어떤 원소일까요?
            </Top.TitleParagraph>
          }
          subtitleBottom={
            <Top.SubtitleParagraph size={17}>
              원자번호 {currentQuizQuestion.element.atomicNumber}
            </Top.SubtitleParagraph>
          }
        />

        <section className="quiz-options" aria-label="퀴즈 선택지">
          {currentQuizQuestion.options.map((option) => (
            <button
              className="quiz-option"
              key={option.symbol}
              onClick={() => answerQuiz(option.symbol)}
              style={cssVar(
                "--element-color",
                CATEGORY_META[option.category].color,
              )}
              type="button"
            >
              <span className="option-label">{option.nameKo}</span>
              <span className="option-meta">{option.categoryKo}</span>
            </button>
          ))}
        </section>

        <Button
          color="dark"
          display="full"
          onClick={() => setMode("explore")}
          variant="weak"
        >
          원소표로 돌아가기
        </Button>
      </main>
    );
  }

  if (mode === "quiz-result") {
    const missedElements = quizAnswers
      .map((answer) =>
        answer.correct
          ? null
          : quizQuestions.find((question) => question.id === answer.questionId)
              ?.element,
      )
      .filter((element): element is ElementInfo => element != null);

    return (
      <main className="app-screen">
        <Top
          lowerGap={16}
          title={
            <Top.TitleParagraph size={28}>
              {quizScore}/{quizQuestions.length}점
            </Top.TitleParagraph>
          }
          subtitleBottom={
            <Top.SubtitleParagraph size={17}>
              {quizScore === quizQuestions.length
                ? "모든 원소를 맞혔어요."
                : "헷갈린 원소를 카드에서 다시 확인해요."}
            </Top.SubtitleParagraph>
          }
        />

        {missedElements.length > 0 ? (
          <section className="result-list" aria-label="다시 볼 원소">
            {missedElements.map((element) => (
              <button
                className="result-row"
                key={element.symbol}
                onClick={() => selectElement(element, "quiz_result")}
                type="button"
              >
                <span>{element.symbol}</span>
                <strong>{element.nameKo}</strong>
                <small>{element.categoryKo}</small>
              </button>
            ))}
          </section>
        ) : null}

        <section className="action-section">
          <Button display="full" onClick={startQuiz} size="large">
            다시 풀기
          </Button>
          <Button
            color="dark"
            display="full"
            onClick={() => setMode("explore")}
            variant="weak"
          >
            원소표 보기
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-screen">
      <header className="app-header">
        <div className="app-title-row">
          <h1>{APP_META.displayName}</h1>
          <button
            aria-controls="element-search"
            aria-expanded={isSearchOpen}
            className="header-search-button"
            onClick={() => setIsSearchOpen((isOpen) => !isOpen)}
            type="button"
          >
            <span className="search-icon" aria-hidden="true">
              &#128269;
            </span>
            <span>원소찾기</span>
          </button>
        </div>
      </header>

      {isSearchOpen ? (
        <section
          className="search-section"
          id="element-search"
          aria-label="원소 검색"
        >
          <TextField
            autoFocus
            label="원소 검색"
            labelOption="sustain"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="기호, 이름, 원자번호"
            right={
              <Button onClick={submitSearch} size="small" type="button">
                찾기
              </Button>
            }
            value={query}
            variant="box"
          />
        </section>
      ) : null}

      <div className="filter-row" aria-label="원소 분류">
        <FilterButton
          active={categoryFilter === "all"}
          label="전체"
          onClick={() => setCategoryFilter("all")}
        />
        {(
          Object.entries(CATEGORY_META) as Array<
            [ElementCategoryKey, (typeof CATEGORY_META)[ElementCategoryKey]]
          >
        ).map(([key, meta]) => (
          <FilterButton
            active={categoryFilter === key}
            color={meta.color}
            key={key}
            label={meta.label}
            onClick={() => setCategoryFilter(key)}
          />
        ))}
      </div>

      <section className="periodic-scroll" aria-label="주기율표">
        <div className="periodic-grid">
          {GRID_ROWS.flatMap((row) =>
            GRID_COLUMNS.map((column) => {
              const element = ELEMENTS.find(
                (candidate) =>
                  candidate.displayRow === row &&
                  candidate.displayColumn === column,
              );

              if (element == null) {
                return <span className="empty-cell" key={`${row}-${column}`} />;
              }

              const isVisible = filteredElements.includes(element);
              const isSelected = selectedElement.symbol === element.symbol;

              return (
                <button
                  aria-pressed={isSelected}
                  className={`element-tile${isSelected ? " is-selected" : ""}${
                    isVisible ? "" : " is-muted"
                  }`}
                  key={element.symbol}
                  onClick={() => selectElement(element, "table")}
                  style={cssVar(
                    "--element-color",
                    CATEGORY_META[element.category].color,
                  )}
                  type="button"
                >
                  <span className="atomic-number">{element.atomicNumber}</span>
                  <strong>{element.symbol}</strong>
                  <small>{element.nameKo}</small>
                </button>
              );
            }),
          )}
        </div>
      </section>

      <section className="result-list" aria-label="원소 목록">
        {filteredElements.slice(0, 18).map((element) => (
          <button
            className="result-row"
            key={element.symbol}
            onClick={() => selectElement(element, "list")}
            type="button"
          >
            <span>{element.atomicNumber}</span>
            <strong>
              {element.nameKo} · {element.symbol}
            </strong>
            <small>{element.categoryKo}</small>
          </button>
        ))}
      </section>

      <section className="element-detail" id="element-detail">
        <div
          className="element-symbol-card"
          style={cssVar("--element-color", selectedCategoryMeta.color)}
        >
          <span>{selectedElement.atomicNumber}</span>
          <strong>{selectedElement.symbol}</strong>
          <small>{selectedElement.nameEn}</small>
        </div>

        <div className="detail-copy">
          <Badge color="teal" size="small" variant="weak">
            {selectedElement.categoryKo}
          </Badge>
          <h2>{selectedElement.nameKo}</h2>
          <p>
            {selectedElement.period}주기
            {selectedElement.group == null
              ? " f-블록"
              : ` ${selectedElement.group}족`}{" "}
            원소예요. 표준 상태는 {selectedElement.stateKo}이고 원자량은{" "}
            {formatNumber(selectedElement.atomicMass)}u예요.
          </p>
        </div>

        <section
          className="story-card"
          aria-label="원소 이야기"
          style={cssVar("--element-color", selectedCategoryMeta.color)}
        >
          <strong>원소 이야기</strong>
          <p>{selectedElementStory}</p>
        </section>

        <dl className="fact-grid">
          <div>
            <dt>전자배치</dt>
            <dd>{selectedElement.electronConfiguration ?? "확인 필요"}</dd>
          </div>
          <div>
            <dt>전기음성도</dt>
            <dd>{formatNumber(selectedElement.electronegativity)}</dd>
          </div>
          <div>
            <dt>밀도</dt>
            <dd>{formatNumber(selectedElement.density)} g/cm³</dd>
          </div>
          <div>
            <dt>발견</dt>
            <dd>{selectedElement.yearDiscovered ?? "확인 필요"}</dd>
          </div>
        </dl>

        <section className="action-section">
          <Button display="full" onClick={startQuiz} size="large">
            퀴즈 풀기
          </Button>
        </section>
      </section>

      <p className="source-note">
        데이터 기준: {DATA_SOURCE.name} / {KOREAN_NAME_SOURCE.name}
      </p>
    </main>
  );
}

interface FilterButtonProps {
  active: boolean;
  color?: string;
  label: string;
  onClick: () => void;
}

function FilterButton({ active, color, label, onClick }: FilterButtonProps) {
  return (
    <button
      aria-pressed={active}
      className={`filter-chip${active ? " is-active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {color == null ? null : (
        <span className="filter-dot" style={cssVar("--chip-color", color)} />
      )}
      {label}
    </button>
  );
}

function matchesCategory(element: ElementInfo, category: CategoryFilter) {
  return category === "all" || element.category === category;
}

function buildElementStory(element: ElementInfo) {
  return [
    `${element.nameKo}(${element.symbol})는 원자번호 ${element.atomicNumber}번, ${formatPositionStory(element)}에 놓인 ${element.categoryKo} 원소예요.`,
    CATEGORY_STORY_LINES[element.category],
    formatDiscoveryStory(element),
  ].join(" ");
}

function formatPositionStory(element: ElementInfo) {
  if (element.group == null) {
    return `주기율표 아래 따로 펼친 f-블록 ${element.displayColumn - 2}번째 자리`;
  }

  return `${element.period}주기 ${element.group}족`;
}

function formatDiscoveryStory(element: ElementInfo) {
  if (element.yearDiscovered == null) {
    return "발견 기록은 아직 확인이 필요한 상태로 남겨 두었어요.";
  }

  if (element.yearDiscovered === "Ancient") {
    return "발견 연도가 하나로 남아 있지 않을 만큼 오래전부터 인류가 알고 쓰던 원소예요.";
  }

  if (element.state.startsWith("expected-")) {
    return `${element.yearDiscovered}년에 발견된 초중원소라 실제 물성은 아직 예측값으로 다루는 항목이 많아요.`;
  }

  return `${element.yearDiscovered}년에 발견된 것으로 정리되어 있어, 주기율표에서 과학사가 붙은 작은 표지판처럼 볼 수 있어요.`;
}

function matchesQuery(element: ElementInfo, query: string) {
  const normalized = normalizeQuery(query);

  if (normalized.length === 0) {
    return true;
  }

  if (/^\d+$/u.test(normalized)) {
    return String(element.atomicNumber) === normalized;
  }

  if (/^[a-z]{1,2}$/u.test(normalized)) {
    return element.symbol.toLowerCase() === normalized;
  }

  return [
    element.nameKo,
    ...(element.nameAliasesKo ?? []),
    element.nameEn,
    element.categoryKo,
  ].some((value) => normalizeQuery(value).includes(normalized));
}

function normalizeQuery(value: string) {
  return value.trim().replace(/\s+/gu, "").toLowerCase();
}

function buildQuizRound() {
  return pickRandomElements(ELEMENTS, QUIZ_QUESTION_COUNT).map(
    buildQuizQuestion,
  );
}

function buildQuizQuestion(element: ElementInfo): QuizQuestion {
  const optionPool = ELEMENTS.filter(
    (candidate) => candidate.symbol !== element.symbol,
  );
  const options = shuffleElements([
    element,
    ...pickRandomElements(optionPool, QUIZ_OPTION_COUNT - 1),
  ]);

  return {
    id: `q-${element.symbol}`,
    element,
    options,
  };
}

function pickRandomElements(
  elements: readonly ElementInfo[],
  count: number,
): ElementInfo[] {
  const pool = [...elements];
  const selected: ElementInfo[] = [];

  while (selected.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    const [element] = pool.splice(index, 1);
    selected.push(element);
  }

  return selected;
}

function shuffleElements(elements: readonly ElementInfo[]) {
  return pickRandomElements(elements, elements.length);
}

function mustGetElement(atomicNumber: number) {
  const element = ELEMENTS_BY_NUMBER.get(atomicNumber);

  if (element == null) {
    throw new Error(`Missing element data: ${atomicNumber}`);
  }

  return element;
}

function getInitialElementFromUrl() {
  const url = new URL(window.location.href);
  const symbol = url.searchParams.get("element");

  if (symbol == null) {
    return null;
  }

  return ELEMENTS_BY_SYMBOL.get(symbol.toUpperCase()) ?? null;
}

function formatNumber(value: number | null) {
  if (value == null || Number.isNaN(value)) {
    return "확인 필요";
  }

  return Number.isInteger(value)
    ? String(value)
    : value.toLocaleString("ko-KR");
}

function cssVar(name: string, value: string): CSSProperties {
  return { [name]: value } as CSSProperties;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToElementDetail() {
  window.requestAnimationFrame(() => {
    document
      .getElementById("element-detail")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export default App;
