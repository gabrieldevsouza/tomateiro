import { describe, expect, test } from "bun:test";
import { DURATION_SEGMENTS, POMODORO_SETTINGS_FIELDS, readPomodoroSettingsForm } from "../src/features/pomodoro/model/pomodoroSettingsForm";
import { createInitialPomodoroTimerState, getPomodoroCycleProgress, HOUR_MS, MINUTE_MS, SECOND_MS, pomodoroTimerReducer } from "../src/features/pomodoro/model/pomodoroTimer";

function setDuration(data: FormData, name: string, hours: string, minutes: string, seconds: string) {
	data.set(`${name}.hours`, hours);
	data.set(`${name}.minutes`, minutes);
	data.set(`${name}.seconds`, seconds);
}

function validForm() {
	const data = new FormData();
	setDuration(data, "focusDurationMs", "00", "20", "00");
	setDuration(data, "shortBreakDurationMs", "00", "03", "00");
	setDuration(data, "longBreakDurationMs", "00", "10", "00");
	data.set("focusPhasesPerCycle", "3");
	return data;
}

describe("campos e conversão do editor", () => {
	test("converte HH:MM:SS para a configuração e aplica o bloco de 76 minutos", () => {
		const settings = readPomodoroSettingsForm(validForm());
		expect(settings).toEqual({ focusDurationMs: 20 * MINUTE_MS, shortBreakDurationMs: 3 * MINUTE_MS, longBreakDurationMs: 10 * MINUTE_MS, focusPhasesPerCycle: 3 });
		if (!settings) throw new Error("Formulário válido rejeitado");
		const running = pomodoroTimerReducer(createInitialPomodoroTimerState(), { type: "start", nowMs: 1_000 });
		const configured = pomodoroTimerReducer(running, { type: "configure", settings });
		expect(configured.status).toBe("ready");
		expect(configured.remainingMs).toBe(20 * MINUTE_MS);
		expect(getPomodoroCycleProgress(configured).totalDurationMs).toBe(76 * MINUTE_MS);
	});

	test("preserva horas, minutos e segundos distintos nos três tempos", () => {
		const data = validForm();
		setDuration(data, "focusDurationMs", "01", "02", "03");
		setDuration(data, "shortBreakDurationMs", "00", "03", "04");
		setDuration(data, "longBreakDurationMs", "02", "05", "06");
		const settings = readPomodoroSettingsForm(data);
		expect(settings).toEqual({ focusDurationMs: 3_723_000, shortBreakDurationMs: 184_000, longBreakDurationMs: 7_506_000, focusPhasesPerCycle: 3 });
		if (!settings) throw new Error("Formulário válido rejeitado");
		expect(getPomodoroCycleProgress(createInitialPomodoroTimerState(settings)).totalDurationMs).toBe(19_043_000);
	});

	test("reapresentar a configuração em segmentos não altera seus valores nem reinicia o timer", () => {
		const data = validForm();
		setDuration(data, "focusDurationMs", "12", "34", "56");
		const settings = readPomodoroSettingsForm(data)!;
		const running = pomodoroTimerReducer(createInitialPomodoroTimerState(settings), { type: "start", nowMs: 1_000 });
		const displayed = new FormData();
		for (const field of POMODORO_SETTINGS_FIELDS) {
			if (field.kind === "duration") {
				for (const segment of DURATION_SEGMENTS) {
					const amount = Math.floor(settings[field.name] / segment.unit);
					displayed.set(`${field.name}.${segment.name}`, String(segment.name === "hours" ? amount : amount % 60).padStart(2, "0"));
				}
			} else displayed.set(field.name, String(settings[field.name]));
		}
		const parsed = readPomodoroSettingsForm(displayed);
		expect(parsed).toEqual(settings);
		if (!parsed) throw new Error("Formulário válido rejeitado");
		expect(pomodoroTimerReducer(running, { type: "configure", settings: parsed })).toBe(running);
	});

	test("rejeita segmentos ausentes, arquivos, texto, frações e valores acima de cada unidade", () => {
		for (const field of ["focusDurationMs", "shortBreakDurationMs", "longBreakDurationMs"]) {
			for (const segment of ["hours", "minutes", "seconds"]) {
				const name = `${field}.${segment}`;
				const missing = validForm();
				missing.delete(name);
				expect(readPomodoroSettingsForm(missing)).toBeNull();
				for (const value of ["", " ", "abc", "-1", "1.5", "Infinity", segment === "hours" ? "100" : "60"]) {
					const data = validForm();
					data.set(name, value);
					expect(readPomodoroSettingsForm(data)).toBeNull();
				}
				const file = validForm();
				file.set(name, new Blob(["20"]), "value.txt");
				expect(readPomodoroSettingsForm(file)).toBeNull();
			}
		}
	});

	test("rejeita zero total e qualquer duração acima de 99 horas", () => {
		for (const field of ["focusDurationMs", "shortBreakDurationMs", "longBreakDurationMs"]) {
			for (const value of [["00", "00", "00"], ["99", "00", "01"], ["99", "59", "59"]]) {
				const data = validForm();
				setDuration(data, field, value[0], value[1], value[2]);
				expect(readPomodoroSettingsForm(data)).toBeNull();
			}
		}
	});

	test("mantém a validação de 1 a 12 focos", () => {
		for (const value of [null, "", " ", "abc", "0", "-1", "1.5", "13", "Infinity"]) {
			const data = validForm();
			if (value === null) data.delete("focusPhasesPerCycle");
			else data.set("focusPhasesPerCycle", value);
			expect(readPomodoroSettingsForm(data)).toBeNull();
		}
	});

	test.each([SECOND_MS, 99 * HOUR_MS])("aceita o limite de %i ms nos três tempos", (durationMs) => {
		const data = validForm();
		for (const field of ["focusDurationMs", "shortBreakDurationMs", "longBreakDurationMs"]) {
			setDuration(data, field, durationMs === SECOND_MS ? "00" : "99", "00", durationMs === SECOND_MS ? "01" : "00");
		}
		data.set("focusPhasesPerCycle", durationMs === SECOND_MS ? "1" : "12");
		expect(readPomodoroSettingsForm(data)).toEqual({ focusDurationMs: durationMs, shortBreakDurationMs: durationMs, longBreakDurationMs: durationMs, focusPhasesPerCycle: durationMs === SECOND_MS ? 1 : 12 });
	});
});
