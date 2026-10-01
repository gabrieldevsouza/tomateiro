import { describe, expect, test } from "bun:test";
import { getNumberInputRepeatInterval } from "../src/features/pomodoro/components/dialogs/useNumberInput";

describe("aceleração ao segurar as setas dos inputs numéricos", () => {
    test("começa em quatro passos por segundo e termina em dez", () => {
        expect(getNumberInputRepeatInterval(0)).toBe(250);
        expect(getNumberInputRepeatInterval(2500)).toBe(100);
    });

    test("mantém os limites antes do início e depois do fim da aceleração", () => {
        for (const elapsed of [-1, -500, -10000, -Infinity]) {
            expect(getNumberInputRepeatInterval(elapsed)).toBe(250);
        }
        for (const elapsed of [2501, 5000, 60000, Infinity]) {
            expect(getNumberInputRepeatInterval(elapsed)).toBe(100);
        }
    });

    test("usa o intervalo inicial quando o tempo decorrido é NaN", () => {
        expect(getNumberInputRepeatInterval(NaN)).toBe(250);
    });

    test("atinge sete passos por segundo no meio da transição", () => {
        expect(getNumberInputRepeatInterval(1250)).toBeCloseTo(1000 / 7, 10);
    });

    test("acelera progressivamente sem ultrapassar dez passos por segundo", () => {
        let previousInterval = getNumberInputRepeatInterval(0);
        for (let elapsed = 25; elapsed <= 2500; elapsed += 25) {
            const interval = getNumberInputRepeatInterval(elapsed);
            expect(Number.isFinite(interval)).toBe(true);
            expect(interval).toBeGreaterThanOrEqual(100);
            expect(interval).toBeLessThanOrEqual(previousInterval);
            expect(1000 / interval).toBeLessThanOrEqual(10);
            previousInterval = interval;
        }
    });

    test("a velocidade cresce suavemente, sem uma rampa linear", () => {
        const rate = (elapsed: number) => 1000 / getNumberInputRepeatInterval(elapsed);
        const earlyGain = rate(625) - rate(0);
        const middleGain = rate(1250) - rate(625);
        const finalGain = rate(2500) - rate(1875);
        expect(earlyGain).toBeLessThan(middleGain);
        expect(finalGain).toBeCloseTo(earlyGain, 10);
    });
});
