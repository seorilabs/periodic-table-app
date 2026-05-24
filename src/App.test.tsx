import { Analytics } from "@apps-in-toss/web-framework";
import { TDSMobileProvider } from "@toss/tds-mobile";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import App from "./App";
import { DATA_SOURCE, ELEMENTS, KOREAN_NAME_SOURCE } from "./data/elements";
import type { ElementInfo } from "./data/elements";

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

  it("퀴즈 앱 내 기능 URL로 진입하면 퀴즈 화면을 바로 보여준다", () => {
    renderApp("/quiz");

    expect(
      screen.getByText(/^[A-Z][a-z]?는 어떤 원소일까요\?$/u),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("퀴즈 선택지")).toBeInTheDocument();
  });

  it("퀴즈를 끝내고 결과 화면을 보여준다", async () => {
    const user = renderApp();

    await user.click(screen.getByRole("button", { name: "퀴즈 풀기" }));
    for (let index = 0; index < 5; index += 1) {
      const element = getCurrentQuizElement();
      const options = within(screen.getByLabelText("퀴즈 선택지")).getAllByRole(
        "button",
      );

      expect(options).toHaveLength(4);
      options.forEach((option) => {
        const optionElement = ELEMENTS.find((item) =>
          option.textContent?.includes(item.nameKo),
        );

        expect(optionElement).toBeDefined();
        expect(option).not.toHaveTextContent(optionElement?.symbol ?? "");
      });

      await user.click(getQuizOptionByElement(element));
    }

    expect(screen.getByText("5/5점")).toBeInTheDocument();
    expect(Analytics.click).toHaveBeenCalledWith(
      expect.objectContaining({
        log_name: "periodic_table_quiz_completed",
        score: 5,
        total: 5,
      }),
    );
    expect(
      screen.queryByRole("button", { name: /공유/u }),
    ).not.toBeInTheDocument();
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
