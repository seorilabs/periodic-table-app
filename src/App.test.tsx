import { Analytics } from "@apps-in-toss/web-framework";
import { TDSMobileProvider } from "@toss/tds-mobile";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import App from "./App";
import { DATA_SOURCE, ELEMENTS, KOREAN_NAME_SOURCE } from "./data/elements";
import type { ElementInfo } from "./data/elements";
import { triggerAitBackEvent } from "./test/setup";

const testUserAgent = {
  fontA11y: undefined,
  fontScale: 100,
  isAndroid: false,
  isIOS: true,
};

describe("원소 주기율표 앱", () => {
  it("첫 화면에서 주기율표와 기본 원소 카드를 보여준다", () => {
    renderApp();

    expect(screen.getByText("원소 주기율표")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "원소찾기" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "전체" })).toBeInTheDocument();
    expect(screen.getByLabelText("주기율표")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "산소" })).toBeInTheDocument();
    expect(screen.getByText("원소 이야기")).toBeInTheDocument();
    expect(screen.getByText(/산소\(O\)는 원자번호 8번/u)).toBeInTheDocument();
    expect(
      screen.getByText(
        `데이터 기준: ${DATA_SOURCE.name} / ${KOREAN_NAME_SOURCE.name}`,
      ),
    ).not.toHaveTextContent(DATA_SOURCE.retrievedAt);
    expect(
      screen.queryByRole("button", { name: /공유/u }),
    ).not.toBeInTheDocument();
    expect(ELEMENTS).toHaveLength(118);
  });

  it("기호 검색으로 원소 카드를 선택하고 검색 지표를 기록한다", async () => {
    const user = renderApp();

    await user.click(screen.getByRole("button", { name: "원소찾기" }));
    await user.type(screen.getByPlaceholderText("기호, 이름, 원자번호"), "Na");
    await user.click(screen.getByRole("button", { name: "찾기" }));

    expect(screen.getByRole("heading", { name: "소듐" })).toBeInTheDocument();
    expect(screen.getByText(/소듐\(Na\)는 원자번호 11번/u)).toBeInTheDocument();
    expect(Analytics.click).toHaveBeenCalledWith(
      expect.objectContaining({
        log_name: "periodic_table_search_submit",
        query_type: "symbol",
        result_count: 1,
      }),
    );
    expect(Analytics.click).toHaveBeenCalledWith(
      expect.objectContaining({
        log_name: "periodic_table_element_open",
        symbol: "Na",
        source: "search",
      }),
    );
  });

  it("옛 원소명 별칭으로도 원소를 검색한다", async () => {
    const user = renderApp();

    await user.click(screen.getByRole("button", { name: "원소찾기" }));
    await user.type(
      screen.getByPlaceholderText("기호, 이름, 원자번호"),
      "나트륨",
    );
    await user.click(screen.getByRole("button", { name: "찾기" }));

    expect(screen.getByRole("heading", { name: "소듐" })).toBeInTheDocument();
    expect(Analytics.click).toHaveBeenCalledWith(
      expect.objectContaining({
        log_name: "periodic_table_search_submit",
        query_type: "name",
        result_count: 1,
      }),
    );
  });

  it("원소 URL로 진입하면 해당 원소와 조회 지표를 보여준다", async () => {
    renderApp("/elements?element=Fe");

    expect(screen.getByRole("heading", { name: "철" })).toBeInTheDocument();
    await waitFor(() => {
      expect(Analytics.click).toHaveBeenCalledWith(
        expect.objectContaining({
          log_name: "periodic_table_element_open",
          symbol: "Fe",
          source: "url",
        }),
      );
    });
  });

  it("퀴즈 앱 내 기능 URL로 진입하면 난이도 선택 화면을 보여준다", () => {
    renderApp("/quiz");

    expect(
      screen.getByRole("heading", { name: "퀴즈 난이도 선택" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("퀴즈 난이도")).toBeInTheDocument();
  });

  it("쉬움 난이도 퀴즈를 풀고 광고 게이트에서 광고 없이 결과로 진입한다", async () => {
    const user = renderApp();

    await user.click(screen.getByRole("button", { name: "퀴즈 풀기" }));
    await user.click(screen.getByRole("button", { name: /쉬움/u }));

    expect(Analytics.click).toHaveBeenCalledWith(
      expect.objectContaining({
        log_name: "periodic_table_quiz_difficulty_selected",
        difficulty: "easy",
      }),
    );

    for (let index = 0; index < 5; index += 1) {
      const element = getCurrentQuizElement();
      const options = within(screen.getByLabelText("퀴즈 선택지")).getAllByRole(
        "button",
      );

      expect(options).toHaveLength(4);

      await user.click(getQuizOptionByElement(element));
    }

    // 마지막 답 직후 광고 호출 + 결과 화면 진입을 기다림 (테스트 mock에서
    // showFullScreenAd는 unsupported로 즉시 반환되므로 결과 화면이 곧바로 표시됨)
    await waitFor(() => {
      expect(screen.getByText("5/5점")).toBeInTheDocument();
    });

    expect(Analytics.click).toHaveBeenCalledWith(
      expect.objectContaining({
        log_name: "periodic_table_quiz_completed",
        score: 5,
        total: 5,
        difficulty: "easy",
      }),
    );
  });

  it("마지막 문항에 광고 안내가 표시되고 이전 문항에는 표시되지 않는다", async () => {
    const user = renderApp();

    await user.click(screen.getByRole("button", { name: "퀴즈 풀기" }));
    await user.click(screen.getByRole("button", { name: /쉬움/u }));

    // 첫 문항: 광고 고지 없음
    expect(
      screen.queryByText(/이 문항이 마지막이에요/u),
    ).not.toBeInTheDocument();

    // 4문항 진행 (5번째 = 마지막 문항 진입)
    for (let index = 0; index < 4; index += 1) {
      const element = getCurrentQuizElement();
      await user.click(getQuizOptionByElement(element));
    }

    // 마지막 문항: 광고 고지 박스 표시
    expect(
      screen.getByText(/이 문항이 마지막이에요/u),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/전면광고가 한 번 표시되고/u),
    ).toBeInTheDocument();
  });

  it("난이도 선택에서 백버튼을 누르면 원소표로 돌아간다", async () => {
    const user = renderApp();

    await user.click(screen.getByRole("button", { name: "퀴즈 풀기" }));
    expect(
      screen.getByRole("heading", { name: "퀴즈 난이도 선택" }),
    ).toBeInTheDocument();

    triggerAitBackEvent();

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "퀴즈 난이도 선택" }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("원소 주기율표")).toBeInTheDocument();
  });

  it("퀴즈 진행 중 백버튼을 누르면 confirm dialog가 뜨고 취소 시 퀴즈가 유지된다", async () => {
    const user = renderApp();

    await user.click(screen.getByRole("button", { name: "퀴즈 풀기" }));
    await user.click(screen.getByRole("button", { name: /쉬움/u }));
    expect(screen.getByLabelText("퀴즈 선택지")).toBeInTheDocument();

    triggerAitBackEvent();

    await waitFor(() => {
      expect(
        screen.getByText(/퀴즈를 중단하시겠어요\?/u),
      ).toBeInTheDocument();
    });

    // 취소
    await user.click(screen.getByRole("button", { name: "계속 풀기" }));

    await waitFor(() => {
      expect(
        screen.queryByText(/퀴즈를 중단하시겠어요\?/u),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText("퀴즈 선택지")).toBeInTheDocument();
  });

  it("퀴즈 진행 중 백버튼 confirm에서 확인을 누르면 난이도 선택으로 돌아간다", async () => {
    const user = renderApp();

    await user.click(screen.getByRole("button", { name: "퀴즈 풀기" }));
    await user.click(screen.getByRole("button", { name: /쉬움/u }));
    triggerAitBackEvent();

    await waitFor(() => {
      expect(
        screen.getByText(/퀴즈를 중단하시겠어요\?/u),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: "중단하고 돌아가기" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "퀴즈 난이도 선택" }),
      ).toBeInTheDocument();
    });
    expect(screen.queryByLabelText("퀴즈 선택지")).not.toBeInTheDocument();
  });
});

function renderApp(path = "/") {
  window.history.replaceState(null, "", path);

  render(
    <TDSMobileProvider resetGlobalCss={false} userAgent={testUserAgent}>
      <App />
    </TDSMobileProvider>,
  );

  return userEvent.setup();
}

function getCurrentQuizElement(): ElementInfo {
  const title = screen.getByText(/^[A-Z][a-z]?는 어떤 원소일까요\?$/u);
  const symbol = title.textContent?.match(
    /^([A-Z][a-z]?)는 어떤 원소일까요\?$/u,
  )?.[1];
  const element = ELEMENTS.find((item) => item.symbol === symbol);

  expect(element).toBeDefined();

  return element as ElementInfo;
}

function getQuizOptionByElement(element: ElementInfo) {
  const options = within(screen.getByLabelText("퀴즈 선택지")).getAllByRole(
    "button",
  );
  const option = options.find(
    (candidate) =>
      candidate.querySelector(".option-label")?.textContent === element.nameKo,
  );

  expect(option).toBeDefined();

  return option as HTMLButtonElement;
}
