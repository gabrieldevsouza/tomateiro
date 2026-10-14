import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import ProgressIndicator from "../src/features/pomodoro/components/ProgressIndicator";
import TimerDisplay from "../src/features/pomodoro/components/TimerDisplay";
import CycleSteps from "../src/features/pomodoro/components/CycleSteps";
import {
    createInitialPomodoroTimerState,
    getPomodoroCycleProgress,
    pomodoroTimerReducer,
    type PomodoroTimerState,
} from "../src/features/pomodoro/model/pomodoroTimer";

function getDaisyVisualRatio(markup: string) {
    const ratio = markup.match(/--pomodoro-progress-ratio:([\d.e+-]+)/)?.[1];
    if (ratio === undefined) throw new Error("Preenchimento fracionário da barra DaisyUI ausente");
    return Number(ratio);
}

describe("pizzas e pausas nos Steps ativos", () => {
    function markers(state: PomodoroTimerState) {
        const markup = renderToStaticMarkup(<CycleSteps
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
        const items = markers(secondFocus);
        expect(items.map(marker => marker.ratio)).toEqual([1, 0, 0]);
        expect(items[0].element).toContain("Foco 1 de 3: percorrido.");
        expect(items[1].element).toContain("Foco 2 de 3: atual.");
        expect(items[1].element).toContain('aria-current="step"');
        expect(items[2].element).toContain("Foco 3 de 3: próximo.");
    });

    test("frações avançam sem antecipar pausas e a retomada conserva o progresso", () => {
        let state = pomodoroTimerReducer(initialState(), { type: "start", nowMs: 0 });
        // SSR does not run WAAPI: pause a snapshot at each sample to inspect its visual fraction.
        const before = markers(pomodoroTimerReducer(state, { type: "pause", nowMs: 500 }));
        const after = markers(pomodoroTimerReducer(state, { type: "pause", nowMs: 501 }));
        expect(before[0].ratio).toBe(0.5);
        expect(after[0].ratio).toBe(0.501);
        expect(before[0].element).toContain("Progresso: 50%.");
        expect(after[0].element).toContain("Progresso: 50%.");
        expect(after.map(marker => marker.pauseRatio)).toEqual([0, 0, 0]);

        state = pomodoroTimerReducer(state, { type: "skip" });
        state = pomodoroTimerReducer(state, { type: "start", nowMs: 2_000 });
        const fractional = markers(pomodoroTimerReducer(state, { type: "pause", nowMs: 2_001.5 }));
        expect(fractional.map(marker => marker.pauseRatio)).toEqual([0, 0.0015, 0]);
        expect(fractional[1].element).toContain("Pausa entre os focos 1 e 2: 0%.");
        state = pomodoroTimerReducer(state, { type: "pause", nowMs: 2_500 });
        expect(markers(state).map(marker => marker.pauseRatio)).toEqual([0, 0.5, 0]);
        state = pomodoroTimerReducer(state, { type: "start", nowMs: 8_000 });
        expect(markers(pomodoroTimerReducer(state, { type: "pause", nowMs: 8_000 }))
            .map(marker => marker.pauseRatio)).toEqual([0, 0.5, 0]);
        const almostDone = markers(pomodoroTimerReducer(state, { type: "pause", nowMs: 8_499.5 }));
        expect(almostDone.map(marker => marker.pauseRatio)).toEqual([0, 0.9995, 0]);
        expect(almostDone[1].element).toContain("Pausa entre os focos 1 e 2: 99%.");
        state = pomodoroTimerReducer(state, { type: "tick", nowMs: 8_500 });
        expect(markers(state).map(marker => marker.pauseRatio)).toEqual([0, 1, 0]);
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
        // Inspect the attribute, not the Tailwind variant inside className.
        expect(single[0].element).not.toMatch(/\sdata-row-start=/);
        expect(single[0].element).toMatch(/><\/li>$/);
    });

    test("até quatro focos permanecem em uma fileira, sem entrada de segunda fileira", () => {
        for (const focusCount of [1, 2, 3, 4]) {
            const items = markers(initialState(focusCount));
            expect(items).toHaveLength(focusCount);
            for (const [index, item] of items.entries()) {
                expect(item.element).toContain(`Foco ${index + 1} de ${focusCount}:`);
                expect(item.element).not.toMatch(/\sdata-row-start=/);
                expect(item.element).not.toMatch(/\sdata-lower-row=/);
            }
        }
    });

    test("de cinco a doze focos preservam a ordem e equilibram as duas fileiras", () => {
        for (const [focusCount, upperCount, lowerCount] of [
            [5, 3, 2], [6, 3, 3], [7, 4, 3], [8, 4, 4],
            [9, 5, 4], [10, 5, 5], [11, 6, 5], [12, 6, 6],
        ] as const) {
            const items = markers(initialState(focusCount));
            expect(items).toHaveLength(focusCount);
            expect(items.filter(item => item.element.includes('data-lower-row="true"')))
                .toHaveLength(lowerCount);
            expect(items.filter(item => item.element.includes('data-row-start="true"')))
                .toHaveLength(1);
            for (const [index, item] of items.entries()) {
                expect(item.element).toContain(`Foco ${index + 1} de ${focusCount}:`);
                expect(item.element.includes('data-lower-row="true"')).toBe(index >= upperCount);
                expect(item.element.includes('data-row-start="true"')).toBe(index === upperCount);
            }
            expect(items.map(item => item.pauseRatio)).toEqual(Array(focusCount).fill(0));
        }
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
});
