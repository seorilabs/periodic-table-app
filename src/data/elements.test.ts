import { describe, expect, it } from "vitest";

import {
  CATEGORY_META,
  ELEMENTS,
  KOREAN_NAME_SOURCE,
  STATE_LABELS,
} from "./elements";

describe("원소 데이터", () => {
  it("118개 원소가 원자번호 순서와 고유 주기율표 셀을 유지한다", () => {
    expect(ELEMENTS).toHaveLength(118);

    const symbols = new Set<string>();
    const displayCells = new Set<string>();

    ELEMENTS.forEach((element, index) => {
      expect(element.atomicNumber).toBe(index + 1);
      expect(symbols.has(element.symbol)).toBe(false);
      symbols.add(element.symbol);

      const displayCell = `${element.displayRow}:${element.displayColumn}`;
      expect(displayCells.has(displayCell)).toBe(false);
      displayCells.add(displayCell);

      expect(CATEGORY_META[element.category].label).toBe(element.categoryKo);
      expect(STATE_LABELS[element.state]).toBe(element.stateKo);
    });
  });

  it("대한화학회 새이름을 표시명으로 쓰고 옛 이름은 검색 별칭으로 둔다", () => {
    expect(KOREAN_NAME_SOURCE.url).toBe("https://kchem.org/iupacname");

    expect(elementBySymbol("Na")).toMatchObject({
      nameKo: "소듐",
      nameAliasesKo: ["나트륨"],
    });
    expect(elementBySymbol("K")).toMatchObject({
      nameKo: "포타슘",
      nameAliasesKo: ["칼륨"],
    });
    expect(elementBySymbol("Ti")).toMatchObject({
      nameKo: "타이타늄",
      nameAliasesKo: ["티타늄", "티탄"],
    });
    expect(elementBySymbol("Ge")).toMatchObject({
      nameKo: "저마늄",
      nameAliasesKo: ["게르마늄"],
    });
    expect(elementBySymbol("Db")).toMatchObject({
      nameKo: "두브늄",
      nameAliasesKo: ["더브늄"],
    });
  });
});

function elementBySymbol(symbol: string) {
  const element = ELEMENTS.find((item) => item.symbol === symbol);

  expect(element).toBeDefined();

  return element;
}
