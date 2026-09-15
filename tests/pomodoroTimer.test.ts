import { describe, expect, test } from "bun:test";

import {
    FOCUS_DURATION_MS,
    LONG_BREAK_DURATION_MS,
    MINUTE_MS,
    SHORT_BREAK_DURATION_MS,
    createInitialPomodoroTimerState,
    getPomodoroCycleProgress,
    pomodoroTimerReducer,
    type PomodoroTimerState,
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

describe("pomodoroTimerReducer", () => {
    test("cria o estado inicial de foco pronto", () => {
        expect(initialState()).toEqual({
            phase: "focus",
            status: "ready",
            baseDurationMs: FOCUS_DURATION_MS,
            totalDurationMs: FOCUS_DURATION_MS,
            remainingMs: FOCUS_DURATION_MS,
            endsAtMs: null,
            completedFocusCycles: 0,
            completionId: 0,
            cyclePhaseIndex: 0,
            cycleElapsedBeforePhaseMs: 0,
            cycleTotalDurationMs: 130 * MINUTE_MS,
        });
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
        expect(state.completedFocusCycles).toBe(1);
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
        expect(state.completedFocusCycles).toBe(1);
        expect(state.completionId).toBe(1);
    });

    test("adiciona um minuto em timer pronto e rodando", () => {
        const ready = pomodoroTimerReducer(initialState(), {
            type: "addMinute",
        });
        expect(ready.totalDurationMs).toBe(FOCUS_DURATION_MS + MINUTE_MS);
        expect(ready.remainingMs).toBe(FOCUS_DURATION_MS + MINUTE_MS);

        const running = pomodoroTimerReducer(initialState(), {
            type: "start",
            nowMs: NOW_MS,
        });
        const extended = pomodoroTimerReducer(running, {
            type: "addMinute",
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
            pomodoroTimerReducer(completed, { type: "addMinute" }),
        ).toBe(completed);
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

        expect(state.completedFocusCycles).toBe(4);
        expect(getPomodoroCycleProgress(state).focusProgress).toEqual([100, 100, 100, 100]);
        const next = pomodoroTimerReducer(state, { type: "start", nowMs: NOW_MS });
        expect(next.status).toBe("running");
        expect(next.phase).toBe("focus");
        expect(next.completedFocusCycles).toBe(4);
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
        const extended = pomodoroTimerReducer(halfway, { type: "addMinute" });
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
        const first = pomodoroTimerReducer(initialState(), { type: "addMinute" });
        const shortBreak = pomodoroTimerReducer(completePhase(first), { type: "skip" });
        const secondFocus = pomodoroTimerReducer(completePhase(shortBreak), { type: "skip" });
        const extended = pomodoroTimerReducer(secondFocus, { type: "addMinute" });
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
        const extended = pomodoroTimerReducer(initialState(), { type: "addMinute" });
        const running = pomodoroTimerReducer(extended, { type: "start", nowMs: NOW_MS });
        const partial = pomodoroTimerReducer(running, { type: "tick", nowMs: NOW_MS + MINUTE_MS });
        const skipped = pomodoroTimerReducer(partial, { type: "skip" });

        expect(skipped.phase).toBe("shortBreak");
        expect(skipped.completedFocusCycles).toBe(0);
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
        expect(state.completedFocusCycles).toBe(0);
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
        expect(skipped.completedFocusCycles).toBe(4);
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
        const extended = pomodoroTimerReducer(readyAtPhase(7), { type: "addMinute" });
        expect(getPomodoroCycleProgress(extended).totalDurationMs).toBe(131 * MINUTE_MS);
        expect(getPomodoroCycleProgress(extended).remainingMs).toBe(16 * MINUTE_MS);
        const completed = completePhase(extended);
        expect(getPomodoroCycleProgress(completed).remainingMs).toBe(0);
        const next = pomodoroTimerReducer(completed, { type: "start", nowMs: NOW_MS });
        expect(getPomodoroCycleProgress(next)).toEqual(getPomodoroCycleProgress(initialState()));
    });
});
