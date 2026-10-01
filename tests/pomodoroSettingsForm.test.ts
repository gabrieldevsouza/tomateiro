import { describe, expect, test } from "bun:test";
import { DURATION_SEGMENTS, POMODORO_SETTINGS_FIELDS, getPomodoroDurationSegments, parsePomodoroSettingsForm, readPomodoroSettingsForm } from "../src/features/pomodoro/model/pomodoroSettingsForm";
import { createInitialPomodoroTimerState, getPomodoroCycleProgress, MINUTE_MS, pomodoroTimerReducer } from "../src/features/pomodoro/model/pomodoroTimer";

function setDuration(data: FormData, name: string, hours: string, minutes: string, seconds: string) {
	data.set(`${name}.hours`, hours);
	data.set(`${name}.minutes`, minutes);
	data.set(`${name}.seconds`, seconds);
}

function validForm() {
	const data = new FormData();
	setDuration(data, "focusDurationSeconds", "00", "20", "00");
	setDuration(data, "shortBreakDurationSeconds", "00", "03", "00");
	setDuration(data, "longBreakDurationSeconds", "00", "10", "00");
	data.set("focusPhasesPerCycle", "3");
	return data;
}

describe("campos e conversão do editor", () => {
	test("converte HH:MM:SS para a configuração e aplica o bloco de 76 minutos", () => {
		const settings = readPomodoroSettingsForm(validForm());
		expect(settings).toEqual({ focusDurationSeconds: 1200, shortBreakDurationSeconds: 180, longBreakDurationSeconds: 600, focusPhasesPerCycle: 3 });
		if (!settings) throw new Error("Formulário válido rejeitado");
		const running = pomodoroTimerReducer(createInitialPomodoroTimerState(), { type: "start", nowMs: 1_000 });
		const configured = pomodoroTimerReducer(running, { type: "configure", settings });
		expect(configured.status).toBe("ready");
		expect(configured.remainingMs).toBe(20 * MINUTE_MS);
		expect(getPomodoroCycleProgress(configured).totalDurationMs).toBe(76 * MINUTE_MS);
	});

	test("preserva horas, minutos e segundos distintos nos três tempos", () => {
		const data = validForm();
		setDuration(data, "focusDurationSeconds", "01", "02", "03");
		setDuration(data, "shortBreakDurationSeconds", "00", "03", "04");
		setDuration(data, "longBreakDurationSeconds", "02", "05", "06");
		const settings = readPomodoroSettingsForm(data);
		expect(settings).toEqual({ focusDurationSeconds: 3_723, shortBreakDurationSeconds: 184, longBreakDurationSeconds: 7_506, focusPhasesPerCycle: 3 });
		if (!settings) throw new Error("Formulário válido rejeitado");
		expect(getPomodoroCycleProgress(createInitialPomodoroTimerState(settings)).totalDurationMs).toBe(19_043_000);
	});

	test("reapresentar a configuração em segmentos não altera seus valores nem reinicia o timer", () => {
		const data = validForm();
		setDuration(data, "focusDurationSeconds", "12", "34", "56");
		const settings = readPomodoroSettingsForm(data)!;
		const running = pomodoroTimerReducer(createInitialPomodoroTimerState(settings), { type: "start", nowMs: 1_000 });
		const displayed = new FormData();
		for (const field of POMODORO_SETTINGS_FIELDS) {
			if (field.kind === "duration") {
				const values = getPomodoroDurationSegments(settings[field.name]);
				for (const segment of DURATION_SEGMENTS) {
					displayed.set(`${field.name}.${segment.name}`, values[segment.name]);
				}
			} else displayed.set(field.name, String(settings[field.name]));
		}
		const parsed = readPomodoroSettingsForm(displayed);
		expect(parsed).toEqual(settings);
		if (!parsed) throw new Error("Formulário válido rejeitado");
		expect(pomodoroTimerReducer(running, { type: "configure", settings: parsed })).toBe(running);
	});

	test("rejeita segmentos ausentes, arquivos, texto, frações e valores acima de cada unidade", () => {
		for (const field of ["focusDurationSeconds", "shortBreakDurationSeconds", "longBreakDurationSeconds"]) {
			for (const segment of ["hours", "minutes", "seconds"]) {
				const name = `${field}.${segment}`;
				const missing = validForm();
				missing.delete(name);
				expect(readPomodoroSettingsForm(missing)).toBeNull();
				for (const value of ["", " ", "abc", "-1", "1.5", "Infinity", "NaN", "1e1", "0xC", "+1", "1.0", "009", " 1", "1 ", segment === "hours" ? "100" : "60"]) {
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

	test("rejeita zero total e segmentos acima dos limites", () => {
		for (const field of ["focusDurationSeconds", "shortBreakDurationSeconds", "longBreakDurationSeconds"]) {
			for (const value of [["00", "00", "00"], ["100", "00", "00"], ["99", "60", "00"], ["99", "00", "60"]]) {
				const data = validForm();
				setDuration(data, field, value[0], value[1], value[2]);
				expect(readPomodoroSettingsForm(data)).toBeNull();
			}
		}
	});

	test("mantém a validação de 1 a 12 focos", () => {
		for (const value of [null, "", " ", "abc", "0", "-1", "1.5", "13", "Infinity", "1e1", "0xC", "+1", "1.0", "009"]) {
			const data = validForm();
			if (value === null) data.delete("focusPhasesPerCycle");
			else data.set("focusPhasesPerCycle", value);
			expect(readPomodoroSettingsForm(data)).toBeNull();
		}
	});

	test.each([1, 359_999])("aceita o limite de %i segundos nos três tempos", (durationSeconds) => {
		const data = validForm();
		for (const field of ["focusDurationSeconds", "shortBreakDurationSeconds", "longBreakDurationSeconds"]) {
			setDuration(data, field, durationSeconds === 1 ? "00" : "99", durationSeconds === 1 ? "00" : "59", durationSeconds === 1 ? "01" : "59");
		}
		data.set("focusPhasesPerCycle", durationSeconds === 1 ? "1" : "12");
		expect(readPomodoroSettingsForm(data)).toEqual({ focusDurationSeconds: durationSeconds, shortBreakDurationSeconds: durationSeconds, longBreakDurationSeconds: durationSeconds, focusPhasesPerCycle: durationSeconds === 1 ? 1 : 12 });
	});

	test.each([
		[1, { hours: "0", minutes: "0", seconds: "1" }],
		[3723, { hours: "1", minutes: "2", seconds: "3" }],
		[7384, { hours: "2", minutes: "3", seconds: "4" }],
		[11045, { hours: "3", minutes: "4", seconds: "5" }],
		[359999, { hours: "99", minutes: "59", seconds: "59" }],
	] as const)("decompõe %i segundos sem zeros à esquerda", (durationSeconds, expected) => {
		expect(getPomodoroDurationSegments(durationSeconds)).toEqual(expected);
	});

	test("não decompõe duração inválida por normalização ou arredondamento", () => {
		for (const durationSeconds of [0, -1, 1.5, 360_000, NaN, Infinity]) {
			expect(() => getPomodoroDurationSegments(durationSeconds)).toThrow(RangeError);
		}
	});

	test("identifica múltiplos erros pelo campo e segmento antes da soma", () => {
		const data = validForm();
		data.set("focusDurationSeconds.minutes", "87");
		setDuration(data, "shortBreakDurationSeconds", "0", "0", "0");
		data.set("focusPhasesPerCycle", "13");
		const result = parsePomodoroSettingsForm(data);
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error("Formulário inválido aceito");
		expect(result.errors.map(({ field, inputName }) => ({ field, inputName }))).toEqual([
			{ field: "focusDurationSeconds", inputName: "focusDurationSeconds.minutes" },
			{ field: "shortBreakDurationSeconds", inputName: "shortBreakDurationSeconds.hours" },
			{ field: "focusPhasesPerCycle", inputName: "focusPhasesPerCycle" },
		]);
		expect(result.errors[0].message).toContain("Temporizador");
		expect(result.errors[1].message).toContain("Pausa curta");
		expect(result.errors[2].message).toContain("Ciclos");
		expect(readPomodoroSettingsForm(data)).toBeNull();
	});

	test("rejeita 87 minutos ou segundos em qualquer duração sem transporte", () => {
		for (const field of ["focusDurationSeconds", "shortBreakDurationSeconds", "longBreakDurationSeconds"]) {
			for (const segment of ["minutes", "seconds"]) {
				const data = validForm();
				data.set(`${field}.${segment}`, "87");
				const result = parsePomodoroSettingsForm(data);
				expect(result.ok).toBe(false);
				if (result.ok) throw new Error("Segmento inválido aceito");
				expect(result.errors).toHaveLength(1);
				expect(result.errors[0].inputName).toBe(`${field}.${segment}`);
			}
		}
	});

	test("rejeita nomes duplicados em vez de aceitar o primeiro valor", () => {
		for (const name of ["focusDurationSeconds.minutes", "focusPhasesPerCycle"]) {
			const data = validForm();
			data.append(name, "13");
			expect(parsePomodoroSettingsForm(data).ok).toBe(false);
			expect(readPomodoroSettingsForm(data)).toBeNull();
		}
	});

	test("aceita 99:00:01 e o formato discriminado mantém o wrapper compatível", () => {
		const data = validForm();
		setDuration(data, "focusDurationSeconds", "99", "00", "01");
		const result = parsePomodoroSettingsForm(data);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error("Formulário válido rejeitado");
		expect(result.settings.focusDurationSeconds).toBe(356401);
		expect(readPomodoroSettingsForm(data)).toEqual(result.settings);
	});
});
