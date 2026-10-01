import { describe, expect, test } from "bun:test";
import { normalizeNumberInput } from "../src/features/pomodoro/components/dialogs/useNumberInput";

describe("valores dos inputs numéricos do editor", () => {
    test("remove zeros à esquerda em tempos e ciclos", () => {
        for (const min of [0, 1]) {
            expect(normalizeNumberInput("0005", min, 12, "4")).toBe("5");
            expect(normalizeNumberInput("003", min, 12, "4")).toBe("3");
        }
        expect(normalizeNumberInput("000", 0, 59, "25")).toBe("0");
    });

    test("limita horas, minutos, segundos e ciclos, inclusive colagens extensas", () => {
        for (const [min, max] of [[0, 99], [0, 59], [1, 12]]) {
            expect(normalizeNumberInput(String(max), min, max)).toBe(String(max));
            expect(normalizeNumberInput(String(max + 1), min, max)).toBe(String(max));
            expect(normalizeNumberInput("9".repeat(400), min, max)).toBe(String(max));
        }
    });

    test("limpar o tempo produz zero; vazio e zero nos ciclos preservam o valor válido", () => {
        expect(normalizeNumberInput("", 0, 59, "25")).toBe("0");
        for (const value of ["", "0", "000"]) {
            expect(normalizeNumberInput(value, 1, 12, "4")).toBe("4");
            expect(normalizeNumberInput(value, 1, 12)).toBe("1");
        }
    });

    test("ignora sinais, negativos, decimais, expoentes, letras e símbolos sem extrair outro número", () => {
        for (const value of ["-", "+", "-1", "+5", "1.5", "1,5", "1e2", "1E2", "Infinity", "NaN", "abc", "12abc", "5%", " ", "\n", " 5 ", "５", "😀"]) {
            expect(normalizeNumberInput(value, 0, 59, "25")).toBe("25");
            expect(normalizeNumberInput(value, 1, 12, "4")).toBe("4");
        }
    });

    test("inicializa dados inválidos no mínimo do respectivo campo", () => {
        for (const value of ["", "-1", "abc", "NaN"]) {
            expect(normalizeNumberInput(value, 0, 99)).toBe("0");
            expect(normalizeNumberInput(value, 1, 12)).toBe("1");
        }
    });
});
