import { afterEach, describe, expect, test } from "bun:test";
import { registerPomodoroAnimationProperties } from "../src/features/pomodoro/registerPomodoroAnimationProperties";

const originalCSS = Object.getOwnPropertyDescriptor(globalThis, "CSS");

function setCSS(value: unknown) {
  Object.defineProperty(globalThis, "CSS", { configurable: true, value });
}

afterEach(() => {
  if (originalCSS) Object.defineProperty(globalThis, "CSS", originalCSS);
  else Reflect.deleteProperty(globalThis, "CSS");
});

describe("registro das propriedades de animação", () => {
  test("pode ser importado e chamado sem DOM ou sem a API de registro", () => {
    Reflect.deleteProperty(globalThis, "CSS");
    expect(() => registerPomodoroAnimationProperties()).not.toThrow();
    setCSS({});
    expect(() => registerPomodoroAnimationProperties()).not.toThrow();
  });

  test("mantém interpolação numérica, herança dos preenchimentos e isolamento dos dígitos", () => {
    const definitions: PropertyDefinition[] = [];
    setCSS({ registerProperty: (definition: PropertyDefinition) => definitions.push(definition) });
    registerPomodoroAnimationProperties();
    expect(definitions).toEqual([
      { name: "--pomodoro-countdown-row", syntax: "<number>", inherits: false, initialValue: "0" },
      { name: "--pomodoro-pause-ratio", syntax: "<number>", inherits: true, initialValue: "0" },
      { name: "--pomodoro-progress-ratio", syntax: "<number>", inherits: true, initialValue: "0" },
      { name: "--pomodoro-countdown-digits", syntax: "<number>", inherits: false, initialValue: "1" },
    ]);
  });

  test("reexecução no mesmo documento tolera duplicatas e completa um registro parcial", () => {
    const names = new Set(["--pomodoro-countdown-row"]);
    let attempts = 0;
    setCSS({ registerProperty: ({ name }: PropertyDefinition) => {
      attempts++;
      if (names.has(name)) throw new DOMException("Already registered", "InvalidModificationError");
      names.add(name);
    } });
    registerPomodoroAnimationProperties();
    registerPomodoroAnimationProperties();
    expect(names.size).toBe(4);
    expect(attempts).toBe(8);
  });

  test("não esconde definições inválidas ou falhas inesperadas", () => {
    const invalid = new DOMException("Invalid syntax", "SyntaxError");
    setCSS({ registerProperty: () => { throw invalid; } });
    expect(() => registerPomodoroAnimationProperties()).toThrow(invalid);
    const unexpected = new Error("Unexpected registration failure");
    setCSS({ registerProperty: () => { throw unexpected; } });
    expect(() => registerPomodoroAnimationProperties()).toThrow(unexpected);
  });
});
