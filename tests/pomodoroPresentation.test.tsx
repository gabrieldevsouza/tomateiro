import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import ProgressIndicator from "../src/features/pomodoro/components/ProgressIndicator";
import ProgressIndicatorLegacy from "../src/features/pomodoro/components/ProgressIndicatorLegacy";
import TimerDisplay from "../src/features/pomodoro/components/TimerDisplay";
import CycleCounterLegacy from "../src/features/pomodoro/components/CycleCounterLegacy";
import CycleSteps from "../src/features/pomodoro/components/CycleStepsLegacy2";
import {
    createInitialPomodoroTimerState,
    getPomodoroCycleProgress,
    pomodoroTimerReducer,
    type PomodoroTimerState,
} from "../src/features/pomodoro/model/pomodoroTimer";

function getVisualRatio(markup: string) {
    const rightInset = markup.match(/clip-path:inset\(0 ([\d.e+-]+)% 0 0 round 9999px\)/)?.[1];
    if (rightInset === undefined) throw new Error("Preenchimento visual ausente");
    return 1 - Number(rightInset) / 100;
}

function getDaisyVisualRatio(markup: string) {
    const ratio = markup.match(/--pomodoro-progress-ratio:([\d.e+-]+)/)?.[1];
    if (ratio === undefined) throw new Error("Preenchimento fracionário da barra DaisyUI ausente");
    return Number(ratio);
}

describe("barra DaisyUI do Pomodoro com preenchimento fracionário", () => {
    test("avança em milissegundos enquanto mantém o percentual inteiro exibido", () => {
        const before = renderToStaticMarkup(<ProgressIndicator totalDurationMs={1_000} remainingMs={500} />);
        const after = renderToStaticMarkup(<ProgressIndicator totalDurationMs={1_000} remainingMs={499} />);
        const nextPercentage = renderToStaticMarkup(<ProgressIndicator totalDurationMs={1_000} remainingMs={494} />);
        expect(after).not.toBe(before);
        for (const [markup, elapsedMs, percentage] of [[before, 500, 50], [after, 501, 50], [nextPercentage, 506, 51]] as const) {
            const element = markup.match(/<progress\b[^>]*>/)?.[0];
            if (!element) throw new Error("Barra nativa ausente");
            const classes = element.match(/class="([^"]*)"/)?.[1].split(/\s+/) ?? [];
            expect(classes).toContain("progress");
            expect(classes).not.toContain("sr-only");
            expect(element).toContain(`value="${elapsedMs}"`);
            expect(element).toContain('max="1000"');
            expect(element).toContain('aria-label="Progresso do ciclo completo"');
            expect(element).toContain(`aria-valuetext="${percentage}%"`);
            expect(getDaisyVisualRatio(markup)).toBeCloseTo(elapsedMs / 1_000, 12);
            expect(markup).toContain(`>${percentage}%</span>`);
        }
    });

    test("preserva frações de milissegundo, limita extremos e só anuncia 100% ao terminar", () => {
        for (const [totalDurationMs, remainingMs, elapsedMs, ratio, percentage] of [
            [1_000, 500.5, 499.5, 0.4995, 50],
            [1_000, 0.5, 999.5, 0.9995, 99],
            [1_000, 0, 1_000, 1, 100],
            [1_000, 2_000, 0, 0, 0],
            [1_000, -500, 1_000, 1, 100],
            [0, 0, 0, 0, 0],
        ] as const) {
            const markup = renderToStaticMarkup(<ProgressIndicator totalDurationMs={totalDurationMs} remainingMs={remainingMs} />);
            expect(markup).toContain(`value="${elapsedMs}"`);
            expect(markup).toContain(`max="${Math.max(1, totalDurationMs)}"`);
            expect(getDaisyVisualRatio(markup)).toBeCloseTo(ratio, 12);
            expect(markup).toContain(`aria-valuetext="${percentage}%"`);
            expect(markup).toContain(`>${percentage}%</span>`);
            expect(markup).not.toContain("NaN");
            expect(markup).not.toContain("Infinity");
        }
    });
});

describe("barra legada com preenchimento fracionário", () => {
    test("a barra avança um milissegundo sem trocar o percentual inteiro exibido", () => {
        const before = renderToStaticMarkup(<ProgressIndicatorLegacy totalDurationMs={1_000} remainingMs={500} />);
        const after = renderToStaticMarkup(<ProgressIndicatorLegacy totalDurationMs={1_000} remainingMs={499} />);
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
        const almostDone = renderToStaticMarkup(<ProgressIndicatorLegacy totalDurationMs={1_000} remainingMs={0.5} />);
        const done = renderToStaticMarkup(<ProgressIndicatorLegacy totalDurationMs={1_000} remainingMs={0} />);
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
            const markup = renderToStaticMarkup(<ProgressIndicatorLegacy totalDurationMs={totalDurationMs} remainingMs={remainingMs} />);
            expect(getVisualRatio(markup)).toBe(ratio);
            expect(markup).not.toContain("NaN");
            expect(markup).not.toContain("Infinity");
        }
    });
});

describe("apresentação do Pomodoro com precisão de milissegundos", () => {
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

    test("os medidores circulares legados acompanham progresso fracionário", () => {
        const before = renderToStaticMarkup(<CycleCounterLegacy focusProgress={[50, 0]} />);
        const after = renderToStaticMarkup(<CycleCounterLegacy focusProgress={[50.1, 0]} />);
        expect(before).toContain('aria-label="Progresso: 50%"');
        expect(after).toContain('aria-label="Progresso: 50.1%"');
        expect(after).not.toBe(before);
    });
});

describe("conectores dos Steps acompanham as pausas curtas", () => {
    function initialState(focusPhasesPerCycle = 4) {
        return createInitialPomodoroTimerState({
            focusDurationMs: 4_000,
            shortBreakDurationMs: 2_000,
            longBreakDurationMs: 6_000,
            focusPhasesPerCycle,
        });
    }

    function connectors(state: PomodoroTimerState) {
        const markup = renderToStaticMarkup(<CycleSteps
            focusProgress={getPomodoroCycleProgress(state).focusProgress}
            currentFocusIndex={Math.floor(state.cyclePhaseIndex / 2)}
            isCurrentFocusComplete={state.phase !== "focus" || state.status === "completed"}
            transitionId={0}
            phase={state.phase}
            phaseDurationMs={state.totalDurationMs}
            phaseRemainingMs={state.remainingMs}
            endsAtMs={state.endsAtMs}
        />);
        return [...markup.matchAll(/<progress\b[^>]*>/g)].map(([element]) => {
            const value = Number(element.match(/\bvalue="([^"]+)"/)?.[1]);
            const max = Number(element.match(/\bmax="([^"]+)"/)?.[1]);
            expect(Number.isFinite(value)).toBe(true);
            expect(max).toBeGreaterThan(0);
            return { value, max, ratio: value / max, element };
        });
    }

    test("permanece vazio no foco e recebe frações reais da pausa, sem antecipar os próximos", () => {
        let state = initialState();
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual([0, 0, 0]);
        state = pomodoroTimerReducer(state, { type: "start", nowMs: 0 });
        state = pomodoroTimerReducer(state, { type: "tick", nowMs: 2_000 });
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual([0, 0, 0]);
        state = pomodoroTimerReducer(state, { type: "skip" });
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual([0, 0, 0]);
        state = pomodoroTimerReducer(state, { type: "start", nowMs: 2_000 });
        state = pomodoroTimerReducer(state, { type: "tick", nowMs: 2_001.5 });
        const fractional = connectors(state);
        expect(fractional[0].value).toBe(1.5);
        expect(fractional[0].max).toBe(2_000);
        expect(fractional[0].element).toContain('aria-label="Progresso da pausa entre os focos 1 e 2"');
        expect(fractional.slice(1).map(({ ratio }) => ratio)).toEqual([0, 0]);
        state = pomodoroTimerReducer(state, { type: "pause", nowMs: 3_000 });
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual([0.5, 0, 0]);
        state = pomodoroTimerReducer(state, { type: "start", nowMs: 8_000 });
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual([0.5, 0, 0]);
        state = pomodoroTimerReducer(state, { type: "tick", nowMs: 8_999.5 });
        expect(connectors(state)[0].ratio).toBeLessThan(1);
        state = pomodoroTimerReducer(state, { type: "tick", nowMs: 9_000 });
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual([1, 0, 0]);
    });

    test("extras, reinício e Skip alteram apenas a pausa correspondente", () => {
        let state = pomodoroTimerReducer(initialState(), { type: "skip" });
        state = pomodoroTimerReducer(state, { type: "skip" });
        state = pomodoroTimerReducer(state, { type: "skip" });
        state = pomodoroTimerReducer(state, { type: "start", nowMs: 0 });
        state = pomodoroTimerReducer(state, { type: "pause", nowMs: 1_000 });
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual([1, 0.5, 0]);
        state = pomodoroTimerReducer(state, { type: "addMinute", nowMs: 1_000 });
        const extended = connectors(state);
        expect(extended.map(({ ratio }) => ratio)).toEqual([1, 1_000 / 62_000, 0]);
        expect(extended[1].value).toBe(1_000);
        expect(extended[1].max).toBe(62_000);
        state = pomodoroTimerReducer(state, { type: "restart" });
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual([1, 0, 0]);
        state = pomodoroTimerReducer(state, { type: "skip" });
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual([1, 1, 0]);
        state = pomodoroTimerReducer(state, { type: "start", nowMs: 2_000 });
        state = pomodoroTimerReducer(state, { type: "tick", nowMs: 4_000 });
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual([1, 1, 0]);
    });

    test("pausa longa mantém as conexões, novo bloco zera e quantidade limita linhas", () => {
        let state = initialState();
        for (let index = 0; index < 7; index += 1) {
            state = pomodoroTimerReducer(state, { type: "skip" });
        }
        state = pomodoroTimerReducer(state, { type: "start", nowMs: 0 });
        state = pomodoroTimerReducer(state, { type: "tick", nowMs: 3_000 });
        expect(state.phase).toBe("longBreak");
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual([1, 1, 1]);
        state = pomodoroTimerReducer(state, { type: "skip" });
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual([0, 0, 0]);
        state = pomodoroTimerReducer(state, { type: "configure", settings: initialState(1).settings });
        expect(connectors(state)).toHaveLength(0);
        state = pomodoroTimerReducer(state, { type: "configure", settings: initialState(12).settings });
        expect(connectors(state).map(({ ratio }) => ratio)).toEqual(Array(11).fill(0));
    });
});
