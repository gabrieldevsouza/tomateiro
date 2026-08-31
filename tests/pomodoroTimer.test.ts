import { describe, expect, test } from "bun:test";

import {
    FOCUS_DURATION_MS,
    LONG_BREAK_DURATION_MS,
    MINUTE_MS,
    SHORT_BREAK_DURATION_MS,
    createInitialPomodoroTimerState,
    pomodoroTimerReducer,
} from "../src/features/pomodoro/model/pomodoroTimer";

const NOW_MS = 1_000_000;

function initialState() {
    return createInitialPomodoroTimerState();
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
        const completedFourthFocus = {
            ...initialState(),
            completedFocusCycles: 3,
        };
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
