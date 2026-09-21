import { describe, expect, test } from "bun:test";
import { POMODORO_SETTINGS_FIELDS, readPomodoroSettingsForm } from "../src/features/pomodoro/model/pomodoroSettingsForm";
import { createInitialPomodoroTimerState, getPomodoroCycleProgress, MINUTE_MS, pomodoroTimerReducer } from "../src/features/pomodoro/model/pomodoroTimer";

function validForm() {
	const data = new FormData();
	data.set("focusDurationMs", "20");
	data.set("shortBreakDurationMs", "3");
	data.set("longBreakDurationMs", "10");
	data.set("focusPhasesPerCycle", "3");
	return data;
}

describe("campos e conversão do editor", () => {
	test("converte os campos distintos para a configuração e aplica o bloco de 76 minutos", () => {
		const settings = readPomodoroSettingsForm(validForm());
		expect(settings).toEqual({
			focusDurationMs: 20 * MINUTE_MS,
			shortBreakDurationMs: 3 * MINUTE_MS,
			longBreakDurationMs: 10 * MINUTE_MS,
			focusPhasesPerCycle: 3,
		});
		if (!settings) throw new Error("Formulário válido rejeitado");
		const running = pomodoroTimerReducer(createInitialPomodoroTimerState(), { type: "start", nowMs: 1_000 });
		const configured = pomodoroTimerReducer(running, { type: "configure", settings });
		expect(configured.status).toBe("ready");
		expect(configured.remainingMs).toBe(20 * MINUTE_MS);
		expect(getPomodoroCycleProgress(configured).totalDurationMs).toBe(76 * MINUTE_MS);
	});

	test("os campos mostrados ao reabrir preservam valores e não reiniciam uma configuração idêntica", () => {
		const settings = readPomodoroSettingsForm(validForm())!;
		const running = pomodoroTimerReducer(createInitialPomodoroTimerState(settings), { type: "start", nowMs: 1_000 });
		const data = new FormData();
		for (const field of POMODORO_SETTINGS_FIELDS) {
			data.set(field.name, String(running.settings[field.name] / field.unit));
		}
		const parsed = readPomodoroSettingsForm(data);
		expect(parsed).toEqual(settings);
		if (!parsed) throw new Error("Formulário válido rejeitado");
		expect(pomodoroTimerReducer(running, { type: "configure", settings: parsed })).toBe(running);
	});

	test("rejeita campos ausentes, vazios, arquivos, frações e valores fora dos limites", () => {
		for (const name of ["focusDurationMs", "shortBreakDurationMs", "longBreakDurationMs", "focusPhasesPerCycle"]) {
			const missing = validForm();
			missing.delete(name);
			expect(readPomodoroSettingsForm(missing)).toBeNull();
			for (const value of ["", " ", "abc", "0", "-1", "1.5", "Infinity", "181"]) {
				const data = validForm();
				data.set(name, value);
				expect(readPomodoroSettingsForm(data)).toBeNull();
			}
			const file = validForm();
			file.set(name, new Blob(["20"]), "value.txt");
			expect(readPomodoroSettingsForm(file)).toBeNull();
		}
		const excessiveCount = validForm();
		excessiveCount.set("focusPhasesPerCycle", "13");
		expect(readPomodoroSettingsForm(excessiveCount)).toBeNull();
	});

	test.each([1, 180])("aceita o limite de %i minutos em todos os campos de duração", (minutes) => {
		const data = validForm();
		for (const name of ["focusDurationMs", "shortBreakDurationMs", "longBreakDurationMs"]) data.set(name, String(minutes));
		data.set("focusPhasesPerCycle", minutes === 1 ? "1" : "12");
		expect(readPomodoroSettingsForm(data)).toEqual({
			focusDurationMs: minutes * MINUTE_MS,
			shortBreakDurationMs: minutes * MINUTE_MS,
			longBreakDurationMs: minutes * MINUTE_MS,
			focusPhasesPerCycle: minutes === 1 ? 1 : 12,
		});
	});
});
