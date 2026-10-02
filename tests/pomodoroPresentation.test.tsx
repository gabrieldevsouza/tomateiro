import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import ProgressIndicator from "../src/features/pomodoro/components/ProgressIndicator";
import TimerDisplay from "../src/features/pomodoro/components/TimerDisplay";
import CycleCounter from "../src/features/pomodoro/components/CycleCounter";

function getVisualRatio(markup: string) {
    const rightInset = markup.match(/clip-path:inset\(0 ([\d.e+-]+)% 0 0 round 9999px\)/)?.[1];
    if (rightInset === undefined) throw new Error("Preenchimento visual ausente");
    return 1 - Number(rightInset) / 100;
}

describe("apresentação do Pomodoro com precisão de milissegundos", () => {
    test("a barra avança um milissegundo sem trocar o percentual inteiro exibido", () => {
        const before = renderToStaticMarkup(<ProgressIndicator totalDurationMs={1_000} remainingMs={500} />);
        const after = renderToStaticMarkup(<ProgressIndicator totalDurationMs={1_000} remainingMs={499} />);
        expect(before).toContain('value="500"');
        expect(after).toContain('value="501"');
        expect(getVisualRatio(before)).toBe(0.5);
        expect(getVisualRatio(after)).toBeCloseTo(0.501, 12);
        for (const markup of [before, after]) {
            expect(markup).toContain('max="1000"');
            expect(markup).toContain('aria-valuetext="50%"');
            expect(markup).toContain('>50%</span>');
        }
    });

    test("a barra preserva frações de milissegundo e só anuncia 100% ao terminar", () => {
        const almostDone = renderToStaticMarkup(<ProgressIndicator totalDurationMs={1_000} remainingMs={0.5} />);
        const done = renderToStaticMarkup(<ProgressIndicator totalDurationMs={1_000} remainingMs={0} />);
        expect(almostDone).toContain('value="999.5"');
        expect(getVisualRatio(almostDone)).toBeCloseTo(0.9995, 12);
        expect(almostDone).toContain('aria-valuetext="99%"');
        expect(done).toContain('value="1000"');
        expect(getVisualRatio(done)).toBe(1);
        expect(done).toContain('aria-valuetext="100%"');
    });

    test("o preenchimento limita os extremos e mantém valores finitos sem duração", () => {
        for (const [totalDurationMs, remainingMs, ratio] of [
            [1_000, 2_000, 0],
            [1_000, -500, 1],
            [0, 0, 0],
        ] as const) {
            const markup = renderToStaticMarkup(<ProgressIndicator totalDurationMs={totalDurationMs} remainingMs={remainingMs} />);
            expect(getVisualRatio(markup)).toBe(ratio);
            expect(markup).not.toContain("NaN");
            expect(markup).not.toContain("Infinity");
        }
    });

    test("o mostrador mantém MM:SS, HH:MM:SS e arredondamento para cima", () => {
        for (const [remainingMs, text, description] of [
            [1_000.5, "00:02", "0 minutos e 2 segundos restantes"],
            [1_000, "00:01", "0 minutos e 1 segundos restantes"],
            [0.5, "00:01", "0 minutos e 1 segundos restantes"],
            [0, "00:00", "0 minutos e 0 segundos restantes"],
            [3_600_000, "01:00:00", "1 horas, 0 minutos e 0 segundos restantes"],
        ] as const) {
            const markup = renderToStaticMarkup(<TimerDisplay remainingMs={remainingMs} mode="digital" />);
            expect(markup).toContain(`>${text}</time>`);
            expect(markup).toContain(`aria-label="${description}"`);
        }
    });

    test("os medidores circulares acompanham progresso fracionário", () => {
        const before = renderToStaticMarkup(<CycleCounter focusProgress={[50, 0]} />);
        const after = renderToStaticMarkup(<CycleCounter focusProgress={[50.1, 0]} />);
        expect(before).toContain('aria-label="Progresso: 50%"');
        expect(after).toContain('aria-label="Progresso: 50.1%"');
        expect(after).not.toBe(before);
    });
});
