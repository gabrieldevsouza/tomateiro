import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import ProgressIndicator from "../src/features/pomodoro/components/ProgressIndicator";
import ProgressIndicatorLegacy from "../src/features/pomodoro/components/ProgressIndicatorLegacy";
import TimerDisplay from "../src/features/pomodoro/components/TimerDisplay";
import CycleCounterLegacy from "../src/features/pomodoro/components/CycleCounterLegacy";
import CycleSteps from "../src/features/pomodoro/components/CycleStepsLegacy2";
import ActiveCycleSteps from "../src/features/pomodoro/components/CycleSteps";
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

describe("pizzas e pausas nos Steps ativos", () => {
    function markers(state: PomodoroTimerState) {
        const markup = renderToStaticMarkup(<ActiveCycleSteps
            focusProgress={getPomodoroCycleProgress(state).focusProgress}
            currentFocusIndex={Math.floor(state.cyclePhaseIndex / 2)}
            isCurrentFocusComplete={state.phase !== "focus" || state.status === "completed"}
            phase={state.phase}
            phaseDurationMs={state.totalDurationMs}
            phaseRemainingMs={state.remainingMs}
            endsAtMs={state.endsAtMs}
            transitionId={0}
        />);
        return [...markup.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/g)].map(([element]) => {
            const pauseRatio = element.match(/--pomodoro-pause-ratio:([\d.e+-]+)/)?.[1];
            if (pauseRatio === undefined) throw new Error("Preenchimento fracionário da pausa ausente");
            return { element, ratio: getDaisyVisualRatio(element), pauseRatio: Number(pauseRatio) };
        });
    }

    function initialState(focusPhasesPerCycle = 3) {
        return createInitialPomodoroTimerState({
            focusDurationMs: 1_000,
            shortBreakDurationMs: 1_000,
            longBreakDurationMs: 1_000,
            focusPhasesPerCycle,
        });
    }

    test("preserva a fração ao pausar e só anuncia 100% após o prazo", () => {
        const running = pomodoroTimerReducer(initialState(), { type: "start", nowMs: 0 });
        const paused = pomodoroTimerReducer(running, { type: "pause", nowMs: 999.5 });
        const incomplete = markers(paused);
        expect(incomplete.map(marker => marker.ratio)).toEqual([0.9995, 0, 0]);
        expect(incomplete[0].element).toContain('aria-current="step"');
        expect(incomplete[0].element).toContain("Progresso: 99%");
        const completed = markers(pomodoroTimerReducer(running, { type: "tick", nowMs: 1_000 }));
        expect(completed[0].ratio).toBe(1);
        expect(completed[0].element).toContain("Progresso: 100%");
        expect(completed[0].element).not.toContain("aria-current");
    });

    test("Skip preenche o foco, a pausa o conserva e o próximo começa vazio", () => {
        const shortBreak = pomodoroTimerReducer(initialState(), { type: "skip" });
        expect(markers(shortBreak).map(marker => marker.ratio)).toEqual([1, 0, 0]);
        expect(markers(shortBreak).every(marker => !marker.element.includes("aria-current"))).toBe(true);
        const secondFocus = pomodoroTimerReducer(shortBreak, { type: "skip" });
        expect(markers(secondFocus).map(marker => marker.ratio)).toEqual([1, 0, 0]);
        expect(markers(secondFocus)[1].element).toContain('aria-current="step"');
    });

    test("+1 recalcula a pizza e restart preserva os focos anteriores", () => {
        let state = initialState();
        state = pomodoroTimerReducer(state, { type: "skip" });
        state = pomodoroTimerReducer(state, { type: "skip" });
        state = pomodoroTimerReducer(state, { type: "start", nowMs: 0 });
        state = pomodoroTimerReducer(state, { type: "pause", nowMs: 500 });
        expect(markers(state).map(marker => marker.ratio)).toEqual([1, 0.5, 0]);
        state = pomodoroTimerReducer(state, { type: "addMinute", nowMs: 500 });
        expect(markers(state)[1].ratio).toBeCloseTo(500 / 61_000, 12);
        state = pomodoroTimerReducer(state, { type: "restart" });
        expect(markers(state).map(marker => marker.ratio)).toEqual([1, 0, 0]);
    });

    test("pausa preenche só a linha seguinte, conserva os círculos e anuncia 100% somente no prazo", () => {
        const shortBreak = pomodoroTimerReducer(initialState(), { type: "skip" });
        expect(markers(shortBreak).map(marker => marker.pauseRatio)).toEqual([0, 0, 0]);
        const running = pomodoroTimerReducer(shortBreak, { type: "start", nowMs: 0 });
        const paused = pomodoroTimerReducer(running, { type: "pause", nowMs: 999.5 });
        const incomplete = markers(paused);
        expect(incomplete.map(marker => marker.pauseRatio)).toEqual([0, 0.9995, 0]);
        expect(incomplete.map(marker => marker.ratio)).toEqual([1, 0, 0]);
        expect(incomplete[1].element).toContain("Pausa entre os focos 1 e 2: 99%.");
        expect(incomplete.every(marker => !marker.element.includes("aria-current"))).toBe(true);
        const completed = markers(pomodoroTimerReducer(running, { type: "tick", nowMs: 1_000 }));
        expect(completed.map(marker => marker.pauseRatio)).toEqual([0, 1, 0]);
        expect(completed[1].element).toContain("Pausa entre os focos 1 e 2: 100%.");
        expect(completed.map(marker => marker.ratio)).toEqual([1, 0, 0]);
    });

    test("+1, restart e Skip mudam somente a pausa correspondente", () => {
        let state = initialState(4);
        for (let index = 0; index < 3; index += 1) state = pomodoroTimerReducer(state, { type: "skip" });
        state = pomodoroTimerReducer(state, { type: "start", nowMs: 0 });
        state = pomodoroTimerReducer(state, { type: "pause", nowMs: 500 });
        expect(markers(state).map(marker => marker.pauseRatio)).toEqual([0, 1, 0.5, 0]);
        state = pomodoroTimerReducer(state, { type: "addMinute", nowMs: 500 });
        expect(markers(state).map(marker => marker.pauseRatio)).toEqual([0, 1, 500 / 61_000, 0]);
        expect(markers(state).map(marker => marker.ratio)).toEqual([1, 1, 0, 0]);
        state = pomodoroTimerReducer(state, { type: "restart" });
        expect(markers(state).map(marker => marker.pauseRatio)).toEqual([0, 1, 0, 0]);
        state = pomodoroTimerReducer(state, { type: "skip" });
        expect(markers(state).map(marker => marker.pauseRatio)).toEqual([0, 1, 1, 0]);
        expect(markers(state).map(marker => marker.ratio)).toEqual([1, 1, 0, 0]);
        expect(markers(state)[2].element).toContain('aria-current="step"');
    });

    test("a entrada da segunda fileira com cinco focos representa a pausa entre 3 e 4", () => {
        let state = initialState(5);
        for (let index = 0; index < 5; index += 1) state = pomodoroTimerReducer(state, { type: "skip" });
        state = pomodoroTimerReducer(state, { type: "start", nowMs: 0 });
        state = pomodoroTimerReducer(state, { type: "pause", nowMs: 500 });
        const items = markers(state);
        expect(items.map(marker => marker.pauseRatio)).toEqual([0, 1, 1, 0.5, 0]);
        expect(items.map(marker => marker.ratio)).toEqual([1, 1, 1, 0, 0]);
        expect(items.map(marker => marker.element.includes('data-row-start="true"')))
            .toEqual([false, false, false, true, false]);
        expect(items[3].element).toContain("Pausa entre os focos 3 e 4: 50%.");
    });

    test("pausa longa conserva as linhas, novo bloco zera e um foco não cria conexão", () => {
        let state = initialState();
        for (let index = 0; index < 5; index += 1) state = pomodoroTimerReducer(state, { type: "skip" });
        state = pomodoroTimerReducer(state, { type: "start", nowMs: 0 });
        state = pomodoroTimerReducer(state, { type: "pause", nowMs: 500 });
        expect(state.phase).toBe("longBreak");
        expect(markers(state).map(marker => marker.pauseRatio)).toEqual([0, 1, 1]);
        expect(markers(state).map(marker => marker.ratio)).toEqual([1, 1, 1]);
        state = pomodoroTimerReducer(state, { type: "skip" });
        expect(markers(state).map(marker => marker.pauseRatio)).toEqual([0, 0, 0]);
        expect(markers(state).map(marker => marker.ratio)).toEqual([0, 0, 0]);
        const single = markers(initialState(1));
        expect(single).toHaveLength(1);
        expect(single[0].pauseRatio).toBe(0);
        expect(single[0].element).not.toContain("Pausa entre");
        expect(single[0].element).not.toContain("data-row-start");
        expect(single[0].element).toMatch(/><\/li>$/);
    });
});

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
