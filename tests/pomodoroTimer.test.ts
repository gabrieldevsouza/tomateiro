import { describe, expect, test } from "bun:test";

import {
    FOCUS_DURATION_MS,
    LONG_BREAK_DURATION_MS,
    MINUTE_MS,
    HOUR_MS,
    SECOND_MS,
    SHORT_BREAK_DURATION_MS,
    createInitialPomodoroTimerState,
    getPomodoroCycleProgress,
    getProgressPercentage,
    isValidPomodoroSettings,
    pomodoroTimerReducer,
    type PomodoroTimerState,
    type PomodoroSettings,
} from "../src/features/pomodoro/model/pomodoroTimer";

const NOW_MS = 1_000_000;

function initialState() {
    return createInitialPomodoroTimerState();
}

function completePhase(state: PomodoroTimerState) {
    const running = pomodoroTimerReducer(state, { type: "start", nowMs: NOW_MS });
    if (running.endsAtMs === null) {
        throw new Error("A fase deve estar rodando antes de concluir.");
    }
    return pomodoroTimerReducer(running, { type: "tick", nowMs: running.endsAtMs });
}

function readyAtPhase(phaseIndex: number) {
    let state = initialState();
    for (let index = 0; index < phaseIndex; index += 1) {
        state = pomodoroTimerReducer(completePhase(state), { type: "skip" });
    }
    return state;
}

describe("porcentagem apresentada", () => {
    test("reserva 100% para o término do bloco, inclusive no último milissegundo", () => {
        const ready = readyAtPhase(7);
        const running = pomodoroTimerReducer(ready, { type: "start", nowMs: NOW_MS });
        for (const remainingMs of [39_000, 1]) {
            const almostDone = pomodoroTimerReducer(running, {
                type: "tick", nowMs: NOW_MS + LONG_BREAK_DURATION_MS - remainingMs,
            });
            const progress = getPomodoroCycleProgress(almostDone);
            expect(getProgressPercentage(progress.totalDurationMs, progress.remainingMs)).toBe(99);
        }
        const completed = completePhase(running);
        const progress = getPomodoroCycleProgress(completed);
        expect(getProgressPercentage(progress.totalDurationMs, progress.remainingMs)).toBe(100);
        const next = pomodoroTimerReducer(completed, { type: "start", nowMs: NOW_MS });
        const nextProgress = getPomodoroCycleProgress(next);
        expect(getProgressPercentage(nextProgress.totalDurationMs, nextProgress.remainingMs)).toBe(0);
    });

    test("mantém arredondamento intermediário e limites de zero a cem", () => {
        expect(getProgressPercentage(1_000, 505)).toBe(50);
        expect(getProgressPercentage(1_000, 1_001)).toBe(0);
        expect(getProgressPercentage(1_000, -1)).toBe(100);
        expect(getProgressPercentage(0, 0)).toBe(0);
        expect(getProgressPercentage(-1, 0)).toBe(0);
    });
});

describe("pomodoroTimerReducer", () => {
    test("cria o estado inicial de foco pronto", () => {
        expect(initialState()).toEqual({
            settings: {
                focusDurationMs: 25 * MINUTE_MS,
                shortBreakDurationMs: 5 * MINUTE_MS,
                longBreakDurationMs: 15 * MINUTE_MS,
                focusPhasesPerCycle: 4,
            },
            phase: "focus",
            status: "ready",
            baseDurationMs: FOCUS_DURATION_MS,
            totalDurationMs: FOCUS_DURATION_MS,
            remainingMs: FOCUS_DURATION_MS,
            endsAtMs: null,
            completedFocusCount: 0,
            completionId: 0,
            cyclePhaseIndex: 0,
            cycleAccountedBeforePhaseMs: 0,
            cycleTotalDurationMs: 130 * MINUTE_MS,
        });
    });

    test("o inicializador público rejeita configurações inválidas", () => {
        const settings = initialState().settings;
        for (const key of ["focusDurationMs", "shortBreakDurationMs", "longBreakDurationMs", "focusPhasesPerCycle"] as const) {
            for (const value of [0, -1, NaN, Infinity]) {
                expect(() => createInitialPomodoroTimerState({ ...settings, [key]: value })).toThrow(RangeError);
            }
        }
        expect(() => createInitialPomodoroTimerState({ ...settings, focusDurationMs: 1_500 })).toThrow(RangeError);
        expect(() => createInitialPomodoroTimerState({ ...settings, focusDurationMs: 99 * HOUR_MS + SECOND_MS })).toThrow(RangeError);
        expect(() => createInitialPomodoroTimerState({ ...settings, focusPhasesPerCycle: 13 })).toThrow(RangeError);
        expect(createInitialPomodoroTimerState({ ...settings, focusDurationMs: SECOND_MS, focusPhasesPerCycle: 1 }).remainingMs).toBe(SECOND_MS);
        expect(createInitialPomodoroTimerState({ ...settings, focusDurationMs: 99 * HOUR_MS, focusPhasesPerCycle: 12 }).remainingMs).toBe(99 * HOUR_MS);
    });

    test("um horário antigo não aumenta o restante nem desfaz progresso", () => {
        const running = pomodoroTimerReducer(initialState(), { type: "start", nowMs: NOW_MS });
        const partial = pomodoroTimerReducer(running, { type: "tick", nowMs: NOW_MS + MINUTE_MS });
        const staleTick = pomodoroTimerReducer(partial, { type: "tick", nowMs: NOW_MS - MINUTE_MS });
        expect(staleTick.remainingMs).toBe(partial.remainingMs);
        expect(getPomodoroCycleProgress(staleTick)).toEqual(getPomodoroCycleProgress(partial));
        const paused = pomodoroTimerReducer(partial, { type: "pause", nowMs: NOW_MS - MINUTE_MS });
        expect(paused.remainingMs).toBe(partial.remainingMs);
        const extended = pomodoroTimerReducer(partial, { type: "addMinute", nowMs: NOW_MS - MINUTE_MS });
        expect(extended.remainingMs).toBe(partial.remainingMs + MINUTE_MS);
        expect(extended.endsAtMs).toBe(partial.endsAtMs! + MINUTE_MS);
    });

    test("inicia o timer e define o instante de término", () => {
        const state = pomodoroTimerReducer(initialState(), {
            type: "start",
            nowMs: NOW_MS,
        });

        expect(state.status).toBe("running");
        expect(state.remainingMs).toBe(FOCUS_DURATION_MS);
        expect(state.endsAtMs).toBe(NOW_MS + FOCUS_DURATION_MS);
    });

    test("ignora start quando o timer já está rodando", () => {
        const running = pomodoroTimerReducer(initialState(), {
            type: "start",
            nowMs: NOW_MS,
        });

        expect(
            pomodoroTimerReducer(running, {
                type: "start",
                nowMs: NOW_MS + 5_000,
            }),
        ).toBe(running);
    });

    test("atualiza o restante durante tick", () => {
        const running = pomodoroTimerReducer(initialState(), {
            type: "start",
            nowMs: NOW_MS,
        });

        const state = pomodoroTimerReducer(running, {
            type: "tick",
            nowMs: NOW_MS + MINUTE_MS,
        });

        expect(state.status).toBe("running");
        expect(state.remainingMs).toBe(FOCUS_DURATION_MS - MINUTE_MS);
    });

    test("pausa preservando o tempo restante", () => {
        const running = pomodoroTimerReducer(initialState(), {
            type: "start",
            nowMs: NOW_MS,
        });

        const state = pomodoroTimerReducer(running, {
            type: "pause",
            nowMs: NOW_MS + MINUTE_MS,
        });

        expect(state.status).toBe("paused");
        expect(state.remainingMs).toBe(FOCUS_DURATION_MS - MINUTE_MS);
        expect(state.endsAtMs).toBeNull();
    });

    test("conclui ao pausar depois da expiração", () => {
        const running = pomodoroTimerReducer(initialState(), {
            type: "start",
            nowMs: NOW_MS,
        });

        const state = pomodoroTimerReducer(running, {
            type: "pause",
            nowMs: NOW_MS + FOCUS_DURATION_MS,
        });

        expect(state.status).toBe("completed");
        expect(state.remainingMs).toBe(0);
        expect(state.endsAtMs).toBeNull();
        expect(state.completedFocusCount).toBe(1);
        expect(state.completionId).toBe(1);
    });

    test("conclui ao executar tick no instante de expiração", () => {
        const running = pomodoroTimerReducer(initialState(), {
            type: "start",
            nowMs: NOW_MS,
        });

        const state = pomodoroTimerReducer(running, {
            type: "tick",
            nowMs: NOW_MS + FOCUS_DURATION_MS,
        });

        expect(state.status).toBe("completed");
        expect(state.remainingMs).toBe(0);
        expect(state.completedFocusCount).toBe(1);
        expect(state.completionId).toBe(1);
    });

    test("adiciona um minuto em timer pronto e rodando", () => {
        const ready = pomodoroTimerReducer(initialState(), {
            type: "addMinute", nowMs: NOW_MS,
        });
        expect(ready.totalDurationMs).toBe(FOCUS_DURATION_MS + MINUTE_MS);
        expect(ready.remainingMs).toBe(FOCUS_DURATION_MS + MINUTE_MS);

        const running = pomodoroTimerReducer(initialState(), {
            type: "start",
            nowMs: NOW_MS,
        });
        const extended = pomodoroTimerReducer(running, {
            type: "addMinute", nowMs: NOW_MS,
        });
        expect(extended.endsAtMs).toBe(
            NOW_MS + FOCUS_DURATION_MS + MINUTE_MS,
        );
    });

    test("não adiciona minuto em timer concluído", () => {
        const running = pomodoroTimerReducer(initialState(), {
            type: "start",
            nowMs: NOW_MS,
        });
        const completed = pomodoroTimerReducer(running, {
            type: "tick",
            nowMs: NOW_MS + FOCUS_DURATION_MS,
        });

        expect(
            pomodoroTimerReducer(completed, { type: "addMinute", nowMs: NOW_MS }),
        ).toBe(completed);
    });

    test("+1 usa o horário do clique entre ticks e preserva o tempo já decorrido", () => {
        const running = pomodoroTimerReducer(initialState(), { type: "start", nowMs: NOW_MS });
        const extended = pomodoroTimerReducer(running, { type: "addMinute", nowMs: NOW_MS + 125 });
        expect(extended.remainingMs).toBe(FOCUS_DURATION_MS + MINUTE_MS - 125);
        expect(extended.endsAtMs).toBe(NOW_MS + FOCUS_DURATION_MS + MINUTE_MS);
        expect(extended.cycleTotalDurationMs).toBe(131 * MINUTE_MS);
        expect(extended.completionId).toBe(0);
    });

    test("+1 a um milissegundo do vencimento ainda estende a etapa", () => {
        const running = pomodoroTimerReducer(initialState(), { type: "start", nowMs: NOW_MS });
        const extended = pomodoroTimerReducer(running, {
            type: "addMinute", nowMs: NOW_MS + FOCUS_DURATION_MS - 1,
        });
        expect(extended.remainingMs).toBe(MINUTE_MS + 1);
        expect(extended.status).toBe("running");
        expect(extended.completedFocusCount).toBe(0);
        const nextTick = pomodoroTimerReducer(extended, { type: "tick", nowMs: NOW_MS + FOCUS_DURATION_MS });
        expect(nextTick.remainingMs).toBe(MINUTE_MS);
        expect(nextTick.status).toBe("running");
    });

    test.each([0, 100, 5_000])("+1 no vencimento ou %i ms depois conclui sem estender nem contar duas vezes", (delayMs) => {
        const running = pomodoroTimerReducer(initialState(), { type: "start", nowMs: NOW_MS });
        const nowMs = NOW_MS + FOCUS_DURATION_MS + delayMs;
        const completed = pomodoroTimerReducer(running, { type: "addMinute", nowMs });
        expect(completed.status).toBe("completed");
        expect(completed.remainingMs).toBe(0);
        expect(completed.endsAtMs).toBeNull();
        expect(completed.totalDurationMs).toBe(FOCUS_DURATION_MS);
        expect(completed.cycleTotalDurationMs).toBe(130 * MINUTE_MS);
        expect(completed.completedFocusCount).toBe(1);
        expect(completed.completionId).toBe(1);
        for (const type of ["tick", "pause", "addMinute"] as const) {
            expect(pomodoroTimerReducer(completed, { type, nowMs })).toBe(completed);
        }
        expect(pomodoroTimerReducer(running, { type: "tick", nowMs })).toEqual(completed);
        expect(pomodoroTimerReducer(running, { type: "pause", nowMs })).toEqual(completed);
    });

    test.each([1, 7])("+1 ao vencer a pausa na posição %i não registra um foco", (phaseIndex) => {
        const ready = readyAtPhase(phaseIndex);
        const running = pomodoroTimerReducer(ready, { type: "start", nowMs: NOW_MS });
        const completed = pomodoroTimerReducer(running, { type: "addMinute", nowMs: NOW_MS + ready.totalDurationMs });
        expect(completed.status).toBe("completed");
        expect(completed.completedFocusCount).toBe(ready.completedFocusCount);
        expect(completed.completionId).toBe(ready.completionId + 1);
    });

    test("+1 pausado acrescenta tempo sem retomar a contagem", () => {
        const running = pomodoroTimerReducer(initialState(), { type: "start", nowMs: NOW_MS });
        const paused = pomodoroTimerReducer(running, { type: "pause", nowMs: NOW_MS + MINUTE_MS });
        const extended = pomodoroTimerReducer(paused, { type: "addMinute", nowMs: NOW_MS + 60 * MINUTE_MS });
        expect(extended.remainingMs).toBe(FOCUS_DURATION_MS);
        expect(extended.totalDurationMs).toBe(FOCUS_DURATION_MS + MINUTE_MS);
        expect(extended.status).toBe("paused");
        expect(extended.endsAtMs).toBeNull();
    });

    test("reinicia a fase atual", () => {
        const running = pomodoroTimerReducer(initialState(), {
            type: "start",
            nowMs: NOW_MS,
        });
        const paused = pomodoroTimerReducer(running, {
            type: "pause",
            nowMs: NOW_MS + MINUTE_MS,
        });
        const restarted = pomodoroTimerReducer(paused, { type: "restart" });

        expect(restarted.phase).toBe("focus");
        expect(restarted.status).toBe("ready");
        expect(restarted.remainingMs).toBe(FOCUS_DURATION_MS);
        expect(restarted.totalDurationMs).toBe(FOCUS_DURATION_MS);
        expect(restarted.endsAtMs).toBeNull();
    });

    test("pula foco para pausa curta", () => {
        const state = pomodoroTimerReducer(initialState(), { type: "skip" });

        expect(state.phase).toBe("shortBreak");
        expect(state.status).toBe("ready");
        expect(state.remainingMs).toBe(SHORT_BREAK_DURATION_MS);
    });

    test("pula pausa para o próximo foco", () => {
        const skipped = pomodoroTimerReducer(initialState(), { type: "skip" });
        const state = pomodoroTimerReducer(skipped, { type: "skip" });

        expect(state.phase).toBe("focus");
        expect(state.remainingMs).toBe(FOCUS_DURATION_MS);
    });

    test("inicia a próxima fase após conclusão", () => {
        const running = pomodoroTimerReducer(initialState(), {
            type: "start",
            nowMs: NOW_MS,
        });
        const completed = pomodoroTimerReducer(running, {
            type: "tick",
            nowMs: NOW_MS + FOCUS_DURATION_MS,
        });
        const next = pomodoroTimerReducer(completed, {
            type: "start",
            nowMs: NOW_MS + FOCUS_DURATION_MS,
        });

        expect(next.phase).toBe("shortBreak");
        expect(next.status).toBe("running");
        expect(next.remainingMs).toBe(SHORT_BREAK_DURATION_MS);
    });

    test("usa pausa longa após quatro focos concluídos", () => {
        const completedFourthFocus = readyAtPhase(6);
        const running = pomodoroTimerReducer(completedFourthFocus, {
            type: "start",
            nowMs: NOW_MS,
        });
        const completed = pomodoroTimerReducer(running, {
            type: "tick",
            nowMs: NOW_MS + FOCUS_DURATION_MS,
        });
        const next = pomodoroTimerReducer(completed, {
            type: "start",
            nowMs: NOW_MS + FOCUS_DURATION_MS,
        });

        expect(next.phase).toBe("longBreak");
        expect(next.remainingMs).toBe(LONG_BREAK_DURATION_MS);
    });
});

describe("configuração do Pomodoro", () => {
    const settings: PomodoroSettings = {
        focusDurationMs: 20 * MINUTE_MS,
        shortBreakDurationMs: 3 * MINUTE_MS,
        longBreakDurationMs: 10 * MINUTE_MS,
        focusPhasesPerCycle: 3,
    };

    test("aplicar novos valores reinicia o bloco pronto e preserva focos já concluídos", () => {
        const running = pomodoroTimerReducer(readyAtPhase(4), { type: "start", nowMs: NOW_MS });
        const partial = pomodoroTimerReducer(running, { type: "tick", nowMs: NOW_MS + MINUTE_MS });
        const configured = pomodoroTimerReducer(partial, { type: "configure", settings });

        expect(configured.settings).toEqual(settings);
        expect(configured.phase).toBe("focus");
        expect(configured.status).toBe("ready");
        expect(configured.remainingMs).toBe(20 * MINUTE_MS);
        expect(configured.endsAtMs).toBeNull();
        expect(configured.completedFocusCount).toBe(2);
        expect(configured.completionId).toBe(partial.completionId);
        expect(getPomodoroCycleProgress(configured)).toEqual({
            focusProgress: [0, 0, 0],
            totalDurationMs: 76 * MINUTE_MS,
            remainingMs: 76 * MINUTE_MS,
        });
        expect(pomodoroTimerReducer(configured, { type: "tick", nowMs: NOW_MS + 10 * MINUTE_MS })).toBe(configured);
    });

    test("salvar valores idênticos não reinicia um timer em andamento", () => {
        const running = pomodoroTimerReducer(initialState(), { type: "start", nowMs: NOW_MS });
        expect(pomodoroTimerReducer(running, {
            type: "configure", settings: { ...running.settings },
        })).toBe(running);
    });

    test("usa as durações e a quantidade escolhidas em todas as etapas e no próximo bloco", () => {
        let state = pomodoroTimerReducer(initialState(), { type: "configure", settings });
        const phases = ["focus", "shortBreak", "focus", "shortBreak", "focus", "longBreak"] as const;
        const durations = [20, 3, 20, 3, 20, 10];
        for (let index = 0; index < phases.length; index += 1) {
            expect(state.phase).toBe(phases[index]);
            expect(state.remainingMs).toBe(durations[index] * MINUTE_MS);
            state = completePhase(state);
            if (index < phases.length - 1) {
                state = pomodoroTimerReducer(state, { type: "skip" });
            }
        }
        expect(state.completedFocusCount).toBe(3);
        expect(getPomodoroCycleProgress(state)).toEqual({
            focusProgress: [100, 100, 100],
            totalDurationMs: 76 * MINUTE_MS,
            remainingMs: 0,
        });
        const next = pomodoroTimerReducer(state, { type: "start", nowMs: NOW_MS });
        expect(next.settings).toEqual(settings);
        expect(next.remainingMs).toBe(20 * MINUTE_MS);
        expect(getPomodoroCycleProgress(next).focusProgress).toEqual([0, 0, 0]);
        expect(getPomodoroCycleProgress(next).remainingMs).toBe(76 * MINUTE_MS);
    });

    test("as fatias usam a duração configurada do foco", () => {
        const configured = pomodoroTimerReducer(initialState(), { type: "configure", settings });
        const running = pomodoroTimerReducer(configured, { type: "start", nowMs: NOW_MS });
        const partial = pomodoroTimerReducer(running, { type: "tick", nowMs: NOW_MS + 5 * MINUTE_MS });
        expect(getPomodoroCycleProgress(partial)).toEqual({
            focusProgress: [25, 0, 0],
            totalDurationMs: 76 * MINUTE_MS,
            remainingMs: 71 * MINUTE_MS,
        });
    });

    test("um único foco é seguido diretamente pela pausa longa", () => {
        const configured = pomodoroTimerReducer(initialState(), {
            type: "configure", settings: { ...settings, focusPhasesPerCycle: 1 },
        });
        expect(getPomodoroCycleProgress(configured).totalDurationMs).toBe(30 * MINUTE_MS);
        const next = pomodoroTimerReducer(configured, { type: "skip" });
        expect(next.phase).toBe("longBreak");
        expect(next.remainingMs).toBe(10 * MINUTE_MS);
        expect(getPomodoroCycleProgress(next).focusProgress).toEqual([100]);
        expect(pomodoroTimerReducer(next, { type: "skip" }).phase).toBe("focus");
    });

    test("doze focos geram doze marcadores e a pausa longa só vem após o último", () => {
        let state = pomodoroTimerReducer(initialState(), {
            type: "configure", settings: { ...settings, focusPhasesPerCycle: 12 },
        });
        expect(getPomodoroCycleProgress(state).focusProgress).toHaveLength(12);
        for (let index = 0; index < 23; index += 1) {
            expect(state.phase).not.toBe("longBreak");
            state = pomodoroTimerReducer(state, { type: "skip" });
        }
        expect(state.phase).toBe("longBreak");
        expect(getPomodoroCycleProgress(state).focusProgress).toEqual(Array(12).fill(100));
    });

    test("reiniciar preserva os tempos configurados e remove o minuto extra atual", () => {
        const configured = pomodoroTimerReducer(initialState(), { type: "configure", settings });
        const extended = pomodoroTimerReducer(configured, { type: "addMinute", nowMs: NOW_MS });
        expect(getPomodoroCycleProgress(extended).totalDurationMs).toBe(77 * MINUTE_MS);
        const restarted = pomodoroTimerReducer(extended, { type: "restart" });
        expect(restarted.remainingMs).toBe(20 * MINUTE_MS);
        expect(getPomodoroCycleProgress(restarted).totalDurationMs).toBe(76 * MINUTE_MS);
        const shortBreak = pomodoroTimerReducer(restarted, { type: "skip" });
        const extendedBreak = pomodoroTimerReducer(shortBreak, { type: "addMinute", nowMs: NOW_MS });
        expect(pomodoroTimerReducer(extendedBreak, { type: "restart" }).remainingMs).toBe(3 * MINUTE_MS);
    });

    test("rejeita tempos e quantidades inválidos sem alterar o timer", () => {
        const running = pomodoroTimerReducer(initialState(), { type: "start", nowMs: NOW_MS });
        for (const key of ["focusDurationMs", "shortBreakDurationMs", "longBreakDurationMs"] as const) {
            for (const value of [0, -SECOND_MS, 1_500, 99 * HOUR_MS + SECOND_MS, NaN, Infinity]) {
                const invalid = { ...settings, [key]: value };
                expect(isValidPomodoroSettings(invalid)).toBe(false);
                expect(pomodoroTimerReducer(running, { type: "configure", settings: invalid })).toBe(running);
            }
        }
        for (const count of [0, -1, 1.5, 13, NaN, Infinity]) {
            const invalid = { ...settings, focusPhasesPerCycle: count };
            expect(isValidPomodoroSettings(invalid)).toBe(false);
            expect(pomodoroTimerReducer(running, { type: "configure", settings: invalid })).toBe(running);
        }
        expect(isValidPomodoroSettings({ ...settings, focusDurationMs: SECOND_MS, focusPhasesPerCycle: 1 })).toBe(true);
        expect(isValidPomodoroSettings({ ...settings, focusDurationMs: 99 * HOUR_MS, focusPhasesPerCycle: 12 })).toBe(true);
    });

    test("durações de segundos e horas usam o mesmo relógio e progresso do bloco", () => {
        const custom = { ...settings, focusDurationMs: 90 * SECOND_MS, shortBreakDurationMs: 5 * SECOND_MS, longBreakDurationMs: HOUR_MS, focusPhasesPerCycle: 2 };
        const configured = pomodoroTimerReducer(initialState(), { type: "configure", settings: custom });
        const running = pomodoroTimerReducer(configured, { type: "start", nowMs: NOW_MS });
        const halfway = pomodoroTimerReducer(running, { type: "tick", nowMs: NOW_MS + 45 * SECOND_MS });
        expect(getPomodoroCycleProgress(halfway)).toEqual({ focusProgress: [50, 0], totalDurationMs: 3_785_000, remainingMs: 3_740_000 });
        const completed = pomodoroTimerReducer(halfway, { type: "tick", nowMs: NOW_MS + 90 * SECOND_MS });
        expect(completed.status).toBe("completed");
        expect(pomodoroTimerReducer(completed, { type: "start", nowMs: NOW_MS + 90 * SECOND_MS }).remainingMs).toBe(5 * SECOND_MS);
    });

    test("um foco de um segundo conclui no prazo e um bloco máximo mantém valores finitos", () => {
        const minimal = createInitialPomodoroTimerState({ ...settings, focusDurationMs: SECOND_MS });
        const running = pomodoroTimerReducer(minimal, { type: "start", nowMs: NOW_MS });
        expect(pomodoroTimerReducer(running, { type: "tick", nowMs: NOW_MS + 999 }).status).toBe("running");
        expect(pomodoroTimerReducer(running, { type: "tick", nowMs: NOW_MS + SECOND_MS }).status).toBe("completed");
        const maximum = createInitialPomodoroTimerState({ focusDurationMs: 99 * HOUR_MS, shortBreakDurationMs: 99 * HOUR_MS, longBreakDurationMs: 99 * HOUR_MS, focusPhasesPerCycle: 12 });
        expect(getPomodoroCycleProgress(maximum).totalDurationMs).toBe(24 * 99 * HOUR_MS);
        expect(getProgressPercentage(maximum.cycleTotalDurationMs, maximum.cycleTotalDurationMs)).toBe(0);
    });

    test("copia a configuração para evitar mudanças externas no estado", () => {
        const edited = { ...settings };
        const configured = pomodoroTimerReducer(initialState(), { type: "configure", settings: edited });
        edited.focusDurationMs = 99 * MINUTE_MS;
        expect(configured.settings.focusDurationMs).toBe(20 * MINUTE_MS);
        expect(initialState().settings.focusDurationMs).toBe(25 * MINUTE_MS);
    });
});

describe("progresso do ciclo completo", () => {
    test("começa com quatro círculos vazios e 130 minutos restantes", () => {
        expect(getPomodoroCycleProgress(initialState())).toEqual({
            focusProgress: [0, 0, 0, 0],
            totalDurationMs: 130 * MINUTE_MS,
            remainingMs: 130 * MINUTE_MS,
        });
    });

    test("preenche a fatia do foco atual sem arredondar para porcentagens inteiras", () => {
        const running = pomodoroTimerReducer(readyAtPhase(2), {
            type: "start", nowMs: NOW_MS,
        });
        const state = pomodoroTimerReducer(running, {
            type: "tick", nowMs: NOW_MS + 500,
        });
        const progress = getPomodoroCycleProgress(state);

        expect(progress.focusProgress[0]).toBe(100);
        expect(progress.focusProgress[1]).toBeCloseTo(0.0333333333, 8);
        expect(progress.focusProgress.slice(2)).toEqual([0, 0]);
        expect(progress.remainingMs).toBe(100 * MINUTE_MS - 500);
    });

    test("soma quatro focos, três pausas curtas e a pausa longa sem zerar entre etapas", () => {
        const phases = ["focus", "shortBreak", "focus", "shortBreak", "focus", "shortBreak", "focus", "longBreak"] as const;
        const elapsedAtStart = [0, 25, 30, 55, 60, 85, 90, 115];
        const elapsedAtHalf = [12.5, 27.5, 42.5, 57.5, 72.5, 87.5, 102.5, 122.5];
        const elapsedAtEnd = [25, 30, 55, 60, 85, 90, 115, 130];
        const circlesAtHalf = [
            [50, 0, 0, 0], [100, 0, 0, 0],
            [100, 50, 0, 0], [100, 100, 0, 0],
            [100, 100, 50, 0], [100, 100, 100, 0],
            [100, 100, 100, 50], [100, 100, 100, 100],
        ];
        let state = initialState();

        for (let index = 0; index < phases.length; index += 1) {
            expect(state.phase).toBe(phases[index]);
            expect(getPomodoroCycleProgress(state).remainingMs).toBe(
                (130 - elapsedAtStart[index]) * MINUTE_MS,
            );
            const running = pomodoroTimerReducer(state, { type: "start", nowMs: NOW_MS });
            const halfway = pomodoroTimerReducer(running, {
                type: "tick", nowMs: NOW_MS + running.totalDurationMs / 2,
            });
            expect(getPomodoroCycleProgress(halfway)).toEqual({
                focusProgress: circlesAtHalf[index],
                totalDurationMs: 130 * MINUTE_MS,
                remainingMs: (130 - elapsedAtHalf[index]) * MINUTE_MS,
            });
            state = completePhase(running);
            expect(getPomodoroCycleProgress(state).remainingMs).toBe(
                (130 - elapsedAtEnd[index]) * MINUTE_MS,
            );
            if (index < phases.length - 1) {
                state = pomodoroTimerReducer(state, { type: "skip" });
            }
        }

        expect(state.completedFocusCount).toBe(4);
        expect(getPomodoroCycleProgress(state).focusProgress).toEqual([100, 100, 100, 100]);
        const next = pomodoroTimerReducer(state, { type: "start", nowMs: NOW_MS });
        expect(next.status).toBe("running");
        expect(next.phase).toBe("focus");
        expect(next.completedFocusCount).toBe(4);
        expect(getPomodoroCycleProgress(next)).toEqual(getPomodoroCycleProgress(initialState()));
    });

    test("pausar congela o progresso e retomar continua do mesmo ponto", () => {
        const running = pomodoroTimerReducer(readyAtPhase(4), { type: "start", nowMs: NOW_MS });
        const paused = pomodoroTimerReducer(running, { type: "pause", nowMs: NOW_MS + 10 * MINUTE_MS });
        const progress = getPomodoroCycleProgress(paused);
        expect(progress.focusProgress).toEqual([100, 100, 40, 0]);
        expect(progress.remainingMs).toBe(60 * MINUTE_MS);
        expect(pomodoroTimerReducer(paused, { type: "tick", nowMs: NOW_MS + 50 * MINUTE_MS })).toBe(paused);
        const resumed = pomodoroTimerReducer(paused, { type: "start", nowMs: NOW_MS + 50 * MINUTE_MS });
        expect(getPomodoroCycleProgress(resumed)).toEqual(progress);
        const later = pomodoroTimerReducer(resumed, { type: "tick", nowMs: NOW_MS + 55 * MINUTE_MS });
        expect(getPomodoroCycleProgress(later).focusProgress).toEqual([100, 100, 60, 0]);
    });

    test("minutos adicionados permanecem no total após mudar de fase", () => {
        const running = pomodoroTimerReducer(initialState(), { type: "start", nowMs: NOW_MS });
        const halfway = pomodoroTimerReducer(running, { type: "tick", nowMs: NOW_MS + 12.5 * MINUTE_MS });
        const extended = pomodoroTimerReducer(halfway, { type: "addMinute", nowMs: NOW_MS + 12.5 * MINUTE_MS });
        const progress = getPomodoroCycleProgress(extended);
        expect(progress.totalDurationMs).toBe(131 * MINUTE_MS);
        expect(progress.remainingMs).toBe(118.5 * MINUTE_MS);
        expect(progress.focusProgress[0]).toBeCloseTo((12.5 / 26) * 100);

        const next = pomodoroTimerReducer(completePhase(extended), { type: "start", nowMs: NOW_MS });
        expect(next.phase).toBe("shortBreak");
        expect(getPomodoroCycleProgress(next)).toEqual({
            focusProgress: [100, 0, 0, 0],
            totalDurationMs: 131 * MINUTE_MS,
            remainingMs: 105 * MINUTE_MS,
        });
    });

    test("reiniciar descarta só o avanço e os minutos extras da fase atual", () => {
        const first = pomodoroTimerReducer(initialState(), { type: "addMinute", nowMs: NOW_MS });
        const shortBreak = pomodoroTimerReducer(completePhase(first), { type: "skip" });
        const secondFocus = pomodoroTimerReducer(completePhase(shortBreak), { type: "skip" });
        const extended = pomodoroTimerReducer(secondFocus, { type: "addMinute", nowMs: NOW_MS });
        const running = pomodoroTimerReducer(extended, { type: "start", nowMs: NOW_MS });
        const halfway = pomodoroTimerReducer(running, { type: "tick", nowMs: NOW_MS + 13 * MINUTE_MS });
        expect(getPomodoroCycleProgress(halfway).focusProgress).toEqual([100, 50, 0, 0]);

        const restarted = pomodoroTimerReducer(halfway, { type: "restart" });
        expect(restarted.status).toBe("ready");
        expect(restarted.remainingMs).toBe(25 * MINUTE_MS);
        expect(getPomodoroCycleProgress(restarted)).toEqual({
            focusProgress: [100, 0, 0, 0],
            totalDurationMs: 131 * MINUTE_MS,
            remainingMs: 100 * MINUTE_MS,
        });
    });

    test("pular conta toda a duração, inclusive minutos extras, sem registrar foco concluído", () => {
        const extended = pomodoroTimerReducer(initialState(), { type: "addMinute", nowMs: NOW_MS });
        const running = pomodoroTimerReducer(extended, { type: "start", nowMs: NOW_MS });
        const partial = pomodoroTimerReducer(running, { type: "tick", nowMs: NOW_MS + MINUTE_MS });
        const skipped = pomodoroTimerReducer(partial, { type: "skip" });

        expect(skipped.phase).toBe("shortBreak");
        expect(skipped.completedFocusCount).toBe(0);
        expect(getPomodoroCycleProgress(skipped)).toEqual({
            focusProgress: [100, 0, 0, 0],
            totalDurationMs: 131 * MINUTE_MS,
            remainingMs: 105 * MINUTE_MS,
        });
        const secondFocus = pomodoroTimerReducer(skipped, { type: "skip" });
        expect(secondFocus.phase).toBe("focus");
        expect(getPomodoroCycleProgress(secondFocus).remainingMs).toBe(100 * MINUTE_MS);
    });

    test("pular segue as oito etapas do bloco mesmo sem concluir focos", () => {
        let state = initialState();
        for (let index = 0; index < 7; index += 1) {
            state = pomodoroTimerReducer(state, { type: "skip" });
        }
        expect(state.phase).toBe("longBreak");
        expect(state.completedFocusCount).toBe(0);
        expect(getPomodoroCycleProgress(state).focusProgress).toEqual([100, 100, 100, 100]);
        expect(getPomodoroCycleProgress(state).remainingMs).toBe(15 * MINUTE_MS);
        const next = pomodoroTimerReducer(state, { type: "skip" });
        expect(next.phase).toBe("focus");
        expect(getPomodoroCycleProgress(next)).toEqual(getPomodoroCycleProgress(initialState()));
    });

    test("pular o quarto foco já concluído mantém a pausa longa e não conta a etapa duas vezes", () => {
        const completed = completePhase(readyAtPhase(6));
        const beforeSkip = getPomodoroCycleProgress(completed);
        const skipped = pomodoroTimerReducer(completed, { type: "skip" });
        expect(skipped.phase).toBe("longBreak");
        expect(skipped.completedFocusCount).toBe(4);
        expect(getPomodoroCycleProgress(skipped)).toEqual(beforeSkip);
    });

    test("reiniciar um foco concluído restaura a fatia atual sem antecipar outro marcador", () => {
        const completed = completePhase(readyAtPhase(6));
        const restarted = pomodoroTimerReducer(completed, { type: "restart" });
        expect(getPomodoroCycleProgress(restarted).focusProgress).toEqual([100, 100, 100, 0]);
        expect(getPomodoroCycleProgress(restarted).remainingMs).toBe(40 * MINUTE_MS);
        const shortBreak = completePhase(readyAtPhase(1));
        expect(getPomodoroCycleProgress(shortBreak).focusProgress).toEqual([100, 0, 0, 0]);
    });

    test("minutos extras na pausa longa entram no total e são descartados no próximo bloco", () => {
        const extended = pomodoroTimerReducer(readyAtPhase(7), { type: "addMinute", nowMs: NOW_MS });
        expect(getPomodoroCycleProgress(extended).totalDurationMs).toBe(131 * MINUTE_MS);
        expect(getPomodoroCycleProgress(extended).remainingMs).toBe(16 * MINUTE_MS);
        const completed = completePhase(extended);
        expect(getPomodoroCycleProgress(completed).remainingMs).toBe(0);
        const next = pomodoroTimerReducer(completed, { type: "start", nowMs: NOW_MS });
        expect(getPomodoroCycleProgress(next)).toEqual(getPomodoroCycleProgress(initialState()));
    });
});
