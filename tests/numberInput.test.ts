import { describe, expect, test } from "bun:test";
import { normalizeNumberInput, normalizeTypedNumberInput, stepNumberInput } from "../src/features/pomodoro/components/dialogs/useNumberInput";

describe("valores dos inputs numéricos do editor", () => {
    test("remove zeros à esquerda em tempos e ciclos", () => {
        for (const min of [0, 1]) {
            expect(normalizeNumberInput("0005", min, 12, "4")).toBe("5");
            expect(normalizeNumberInput("003", min, 12, "4")).toBe("3");
        }
        expect(normalizeNumberInput("000", 0, 59, "25")).toBe("0");
    });

    test("rejeita valores completos acima do máximo sem substituir o valor anterior", () => {
        for (const [min, max] of [[0, 99], [0, 59], [1, 12]]) {
            expect(normalizeNumberInput(String(max), min, max)).toBe(String(max));
            expect(normalizeNumberInput(String(max + 1), min, max, "4")).toBe("4");
            expect(normalizeNumberInput("9".repeat(400), min, max, "4")).toBe("4");
            expect(normalizeNumberInput(String(max + 1), min, max)).toBe(String(min));
            expect(normalizeNumberInput("0".repeat(400) + "5", min, max, "4")).toBe("5");
        }
    });

    test("normalização estrita usa o mínimo informado, sem habilitar zero de edição", () => {
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
            expect(normalizeTypedNumberInput(value, 0, 59, "25")).toBe("25");
            expect(normalizeTypedNumberInput(value, 0, 12, "4")).toBe("4");
        }
    });

    test("inicializa dados inválidos no mínimo do respectivo campo", () => {
        for (const value of ["", "-1", "abc", "NaN"]) {
            expect(normalizeNumberInput(value, 0, 99)).toBe("0");
            expect(normalizeNumberInput(value, 1, 12)).toBe("1");
        }
    });

    test("não devolve um fallback inválido ou fora dos limites", () => {
        for (const previous of ["", "abc", "NaN", "Infinity", "-1", "1.5", "13"]) {
            expect(normalizeNumberInput("inválido", 1, 12, previous)).toBe("1");
            expect(normalizeTypedNumberInput("inválido", 1, 12, previous)).toBe("1");
        }
        expect(normalizeNumberInput("inválido", 1, 12, "04")).toBe("4");
        expect(normalizeNumberInput("inválido", 1, 12, "0")).toBe("1");
    });

    test("rejeita limites inválidos antes de normalizar ou procurar um sufixo", () => {
        for (const [min, max] of [[0, -1], [-1, 12], [12, 1], [NaN, 12], [0, NaN], [0, Infinity], [0.5, 12], [0, 12.5], [0, Number.MAX_SAFE_INTEGER + 1]]) {
            expect(() => normalizeNumberInput("99", min, max)).toThrow(RangeError);
            expect(() => normalizeTypedNumberInput("99", min, max)).toThrow(RangeError);
            expect(() => stepNumberInput(4, min, max, 1)).toThrow(RangeError);
        }
        expect(normalizeTypedNumberInput("99", 0, 0)).toBe("0");
    });

    test("não calcula passos com um valor não inteiro ou não finito", () => {
        for (const value of [NaN, Infinity, -Infinity, -1, 1.5]) {
            expect(() => stepNumberInput(value, 0, 59, 1)).toThrow(RangeError);
        }
    });

    test("mantém o maior sufixo válido ao continuar digitando minutos ou segundos", () => {
        let value = "54";
        value = normalizeTypedNumberInput(value + "3", 0, 59, value);
        expect(value).toBe("43");
        value = normalizeTypedNumberInput(value + "7", 0, 59, value);
        expect(value).toBe("37");

        value = "56";
        value = normalizeTypedNumberInput(value + "9", 0, 59, value);
        expect(value).toBe("9");
        value = normalizeTypedNumberInput(value + "3", 0, 59, value);
        expect(value).toBe("3");
    });

    test("normaliza o candidato de edição sem acrescentar novamente o valor substituído", () => {
        expect(normalizeTypedNumberInput("3", 0, 59, "54")).toBe("3");
        expect(normalizeTypedNumberInput("34", 0, 59, "3")).toBe("34");
        expect(normalizeTypedNumberInput("59", 0, 59, "5")).toBe("59");
        expect(normalizeTypedNumberInput("60", 0, 59, "6")).toBe("0");
        expect(normalizeNumberInput("60", 0, 59, "6")).toBe("6");
    });

    test("aplica o limite próprio de horas e de ciclos durante a digitação", () => {
        expect(normalizeTypedNumberInput("993", 0, 99, "99")).toBe("93");
        expect(normalizeTypedNumberInput("100", 0, 99, "10")).toBe("0");
        expect(normalizeTypedNumberInput("123", 0, 12, "12")).toBe("3");
        expect(normalizeTypedNumberInput("19", 0, 12, "1")).toBe("9");
        expect(normalizeTypedNumberInput("110", 0, 12, "11")).toBe("10");
        expect(normalizeTypedNumberInput("112", 0, 12, "11")).toBe("12");
        expect(normalizeNumberInput("13", 1, 12, "4")).toBe("4");
        expect(normalizeTypedNumberInput("13", 0, 12, "1")).toBe("3");
    });

    test("permite zero apenas no rascunho dos ciclos e substitui seus zeros à esquerda", () => {
        expect(normalizeTypedNumberInput("", 0, 12, "4")).toBe("0");
        expect(normalizeTypedNumberInput("0", 0, 12, "4")).toBe("0");
        expect(normalizeTypedNumberInput("000", 0, 12, "4")).toBe("0");
        expect(normalizeTypedNumberInput("02", 0, 12, "0")).toBe("2");
        expect(normalizeTypedNumberInput("0005", 0, 59, "0")).toBe("5");
        expect(normalizeNumberInput("0", 1, 12, "4")).toBe("4");
        expect(normalizeTypedNumberInput("0", 1, 12, "4")).toBe("4");
    });

    test("mantém valores finitos dentro da faixa em candidatos digitados extensos", () => {
        expect(normalizeTypedNumberInput("9".repeat(400), 0, 99, "25")).toBe("99");
        expect(normalizeTypedNumberInput("9".repeat(400), 0, 59, "25")).toBe("9");
        expect(normalizeTypedNumberInput("9".repeat(400), 0, 12, "4")).toBe("9");
    });

    test("faz as setas de tempo retornarem ao outro limite sem alterar passos intermediários", () => {
        for (const max of [99, 59]) {
            expect(stepNumberInput(max, 0, max, 1, true)).toBe(0);
            expect(stepNumberInput(0, 0, max, -1, true)).toBe(max);
            expect(stepNumberInput(max - 1, 0, max, 1, true)).toBe(max);
            expect(stepNumberInput(1, 0, max, -1, true)).toBe(0);
            expect(stepNumberInput(25, 0, max, 1, true)).toBe(26);
            expect(stepNumberInput(25, 0, max, -1, true)).toBe(24);
        }
    });

    test("mantém ciclos nos limites e conserva a exceção do zero temporário", () => {
        expect(stepNumberInput(12, 1, 12, 1)).toBe(12);
        expect(stepNumberInput(1, 1, 12, -1)).toBe(1);
        expect(stepNumberInput(11, 1, 12, 1)).toBe(12);
        expect(stepNumberInput(2, 1, 12, -1)).toBe(1);
        expect(stepNumberInput(4, 1, 12, 1)).toBe(5);
        expect(stepNumberInput(4, 1, 12, -1)).toBe(3);
        expect(stepNumberInput(0, 1, 12, 1)).toBe(1);
        expect(stepNumberInput(0, 1, 12, -1)).toBe(0);
    });
});
