type ExpressionVariables = {
  refine?: number;
};

type Token =
  | { type: "number"; value: number }
  | { type: "variable"; value: keyof ExpressionVariables }
  | {
      type: "operator";
      value: "+" | "-" | "*" | "/" | ">" | ">=" | "<" | "<=" | "==" | "!=";
    }
  | { type: "symbol"; value: "(" | ")" | "?" | ":" };

type ExpressionOperator = Extract<Token, { type: "operator" }>["value"];
type ExpressionSymbol = Extract<Token, { type: "symbol" }>["value"];

export function evaluateRathenaExpression(
  expression: string,
  variables: ExpressionVariables,
): number | null {
  const tokens = tokenizeExpression(expression);

  if (!tokens) {
    return null;
  }

  const parser = new ExpressionParser(tokens, variables);
  return parser.parse();
}

function tokenizeExpression(expression: string): Token[] | null {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/\d/.test(char)) {
      let value = char;
      index += 1;

      while (index < expression.length && /\d/.test(expression[index])) {
        value += expression[index];
        index += 1;
      }

      tokens.push({ type: "number", value: Number(value) });
      continue;
    }

    if (expression.startsWith(".@r", index)) {
      tokens.push({ type: "variable", value: "refine" });
      index += 3;
      continue;
    }

    const twoCharOperator = expression.slice(index, index + 2);

    if (isExpressionOperator(twoCharOperator)) {
      tokens.push({
        type: "operator",
        value: twoCharOperator,
      });
      index += 2;
      continue;
    }

    if (isExpressionOperator(char)) {
      tokens.push({
        type: "operator",
        value: char,
      });
      index += 1;
      continue;
    }

    if (isExpressionSymbol(char)) {
      tokens.push({
        type: "symbol",
        value: char,
      });
      index += 1;
      continue;
    }

    return null;
  }

  return tokens;
}

function isExpressionOperator(value: string): value is ExpressionOperator {
  return [">=", "<=", "==", "!=", "+", "-", "*", "/", ">", "<"].includes(
    value,
  );
}

function isExpressionSymbol(value: string): value is ExpressionSymbol {
  return ["(", ")", "?", ":"].includes(value);
}

class ExpressionParser {
  private index = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly variables: ExpressionVariables,
  ) {}

  parse() {
    const value = this.parseTernary();

    if (value === null || this.peek()) {
      return null;
    }

    return Math.trunc(value);
  }

  private parseTernary(): number | null {
    const condition = this.parseComparison();

    if (condition === null) {
      return null;
    }

    if (!this.matchSymbol("?")) {
      return condition;
    }

    const truthyValue = this.parseTernary();

    if (truthyValue === null || !this.matchSymbol(":")) {
      return null;
    }

    const falsyValue = this.parseTernary();

    if (falsyValue === null) {
      return null;
    }

    return condition !== 0 ? truthyValue : falsyValue;
  }

  private parseComparison(): number | null {
    const left = this.parseAdditive();

    if (left === null) {
      return null;
    }

    const operator = this.matchComparisonOperator();

    if (!operator) {
      return left;
    }

    const right = this.parseAdditive();

    if (right === null) {
      return null;
    }

    if (operator === ">") return left > right ? 1 : 0;
    if (operator === ">=") return left >= right ? 1 : 0;
    if (operator === "<") return left < right ? 1 : 0;
    if (operator === "<=") return left <= right ? 1 : 0;
    if (operator === "==") return left === right ? 1 : 0;
    if (operator === "!=") return left !== right ? 1 : 0;

    return null;
  }

  private parseAdditive(): number | null {
    let value = this.parseMultiplicative();

    while (value !== null) {
      if (this.matchOperator("+")) {
        const right = this.parseMultiplicative();
        value = right === null ? null : value + right;
        continue;
      }

      if (this.matchOperator("-")) {
        const right = this.parseMultiplicative();
        value = right === null ? null : value - right;
        continue;
      }

      break;
    }

    return value;
  }

  private parseMultiplicative(): number | null {
    let value = this.parseUnary();

    while (value !== null) {
      if (this.matchOperator("*")) {
        const right = this.parseUnary();
        value = right === null ? null : value * right;
        continue;
      }

      if (this.matchOperator("/")) {
        const right = this.parseUnary();

        if (right === null || right === 0) {
          return null;
        }

        value = Math.trunc(value / right);
        continue;
      }

      break;
    }

    return value;
  }

  private parseUnary(): number | null {
    if (this.matchOperator("-")) {
      const value = this.parseUnary();
      return value === null ? null : -value;
    }

    return this.parsePrimary();
  }

  private parsePrimary(): number | null {
    const token = this.peek();

    if (!token) {
      return null;
    }

    if (token.type === "number") {
      this.index += 1;
      return token.value;
    }

    if (token.type === "variable") {
      this.index += 1;
      return this.variables[token.value] ?? null;
    }

    if (this.matchSymbol("(")) {
      const value = this.parseTernary();

      if (value === null || !this.matchSymbol(")")) {
        return null;
      }

      return value;
    }

    return null;
  }

  private matchComparisonOperator() {
    const token = this.peek();

    if (
      token?.type === "operator" &&
      [">", ">=", "<", "<=", "==", "!="].includes(token.value)
    ) {
      this.index += 1;
      return token.value;
    }

    return null;
  }

  private matchOperator(operator: "+" | "-" | "*" | "/") {
    const token = this.peek();

    if (token?.type === "operator" && token.value === operator) {
      this.index += 1;
      return true;
    }

    return false;
  }

  private matchSymbol(symbol: "(" | ")" | "?" | ":") {
    const token = this.peek();

    if (token?.type === "symbol" && token.value === symbol) {
      this.index += 1;
      return true;
    }

    return false;
  }

  private peek() {
    return this.tokens[this.index];
  }
}
