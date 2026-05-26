import { describe, expect, it } from "vitest";
import { evaluateRathenaExpression } from "./rathena-expression";

describe("evaluateRathenaExpression", () => {
  it("evaluates integer arithmetic with refine variables", () => {
    expect(evaluateRathenaExpression(".@r/2", { refine: 9 })).toBe(4);
    expect(evaluateRathenaExpression("120+(10*(.@r/2))", { refine: 9 })).toBe(
      160,
    );
  });

  it("evaluates simple nested ternaries", () => {
    expect(
      evaluateRathenaExpression("(.@r>=8?70:(.@r>=6?50:30))", { refine: 9 }),
    ).toBe(70);
    expect(
      evaluateRathenaExpression("(.@r>=8?70:(.@r>=6?50:30))", { refine: 7 }),
    ).toBe(50);
    expect(
      evaluateRathenaExpression("(.@r>=8?70:(.@r>=6?50:30))", { refine: 5 }),
    ).toBe(30);
  });

  it("rejects unsupported expressions", () => {
    expect(evaluateRathenaExpression("rand(1,2)", { refine: 9 })).toBeNull();
    expect(evaluateRathenaExpression(".@unknown/2", { refine: 9 })).toBeNull();
  });
});
