import { describe, expect, test } from "bun:test";
import { DURATION_SEGMENTS, POMODORO_SETTINGS_FIELDS, getPomodoroDurationSegments, parsePomodoroSettingsForm, readPomodoroSettingsForm } from "../src/features/pomodoro/model/pomodoroSettingsForm";
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
	test("converte HH:MM:SS diretamente para milissegundos e aplica o bloco de 76 minutos", () => {
		const settings = readPomodoroSettingsForm(validForm());
		expect(settings).toEqual({ focusDurationMs: 1_200_000, shortBreakDurationMs: 180_000, longBreakDurationMs: 600_000, focusPhasesPerCycle: 3 });
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
		for (const field of ["focusDurationMs", "shortBreakDurationMs", "longBreakDurationMs"]) {
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
		for (const field of ["focusDurationMs", "shortBreakDurationMs", "longBreakDurationMs"]) {
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

	test.each([1_000, 359_999_000])("aceita o limite de %i milissegundos nos três tempos", (durationMs) => {
		const data = validForm();
		for (const field of ["focusDurationMs", "shortBreakDurationMs", "longBreakDurationMs"]) {
			setDuration(data, field, durationMs === SECOND_MS ? "00" : "99", durationMs === SECOND_MS ? "00" : "59", durationMs === SECOND_MS ? "01" : "59");
		}
		data.set("focusPhasesPerCycle", durationMs === SECOND_MS ? "1" : "12");
		expect(readPomodoroSettingsForm(data)).toEqual({ focusDurationMs: durationMs, shortBreakDurationMs: durationMs, longBreakDurationMs: durationMs, focusPhasesPerCycle: durationMs === SECOND_MS ? 1 : 12 });
	});

	test.each([
		[1_000, { hours: "0", minutes: "0", seconds: "1" }],
		[3_723_000, { hours: "1", minutes: "2", seconds: "3" }],
		[7_384_000, { hours: "2", minutes: "3", seconds: "4" }],
		[11_045_000, { hours: "3", minutes: "4", seconds: "5" }],
		[359_999_000, { hours: "99", minutes: "59", seconds: "59" }],
	] as const)("decompõe %i milissegundos sem zeros à esquerda", (durationMs, expected) => {
		expect(getPomodoroDurationSegments(durationMs)).toEqual(expected);
	});

	test("não decompõe duração inválida por normalização ou arredondamento", () => {
		for (const durationMs of [0, -1, 999, 1_000.5, 360_000_000, NaN, Infinity]) {
			expect(() => getPomodoroDurationSegments(durationMs)).toThrow(RangeError);
		}
	});

	test("mantém a precisão armazenada e descarta somente a fração de segundo na apresentação HH:MM:SS", () => {
		const durationMs = HOUR_MS + 2 * MINUTE_MS + 3 * SECOND_MS + 456;
		const settings = { ...readPomodoroSettingsForm(validForm())!, focusDurationMs: durationMs };
		expect(getPomodoroDurationSegments(settings.focusDurationMs)).toEqual({ hours: "1", minutes: "2", seconds: "3" });
		const initial = createInitialPomodoroTimerState(settings);
		expect(initial.settings.focusDurationMs).toBe(durationMs);
		expect(initial.remainingMs).toBe(durationMs);
	});

	test("identifica múltiplos erros pelo campo e segmento antes da soma", () => {
		const data = validForm();
		data.set("focusDurationMs.minutes", "87");
		setDuration(data, "shortBreakDurationMs", "0", "0", "0");
		data.set("focusPhasesPerCycle", "13");
		const result = parsePomodoroSettingsForm(data);
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error("Formulário inválido aceito");
		expect(result.errors.map(({ field, inputName }) => ({ field, inputName }))).toEqual([
			{ field: "focusDurationMs", inputName: "focusDurationMs.minutes" },
			{ field: "shortBreakDurationMs", inputName: "shortBreakDurationMs.hours" },
			{ field: "focusPhasesPerCycle", inputName: "focusPhasesPerCycle" },
		]);
		expect(result.errors[0].message).toContain("Temporizador");
		expect(result.errors[1].message).toContain("Pausa curta");
		expect(result.errors[2].message).toContain("Ciclos");
		expect(readPomodoroSettingsForm(data)).toBeNull();
	});

	test("rejeita 87 minutos ou segundos em qualquer duração sem transporte", () => {
		for (const field of ["focusDurationMs", "shortBreakDurationMs", "longBreakDurationMs"]) {
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
		for (const name of ["focusDurationMs.minutes", "focusPhasesPerCycle"]) {
			const data = validForm();
			data.append(name, "13");
			expect(parsePomodoroSettingsForm(data).ok).toBe(false);
			expect(readPomodoroSettingsForm(data)).toBeNull();
		}
	});

	test("aceita 99:00:01 e o formato discriminado mantém o wrapper compatível", () => {
		const data = validForm();
		setDuration(data, "focusDurationMs", "99", "00", "01");
		const result = parsePomodoroSettingsForm(data);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error("Formulário válido rejeitado");
		expect(result.settings.focusDurationMs).toBe(356_401_000);
		expect(readPomodoroSettingsForm(data)).toEqual(result.settings);
	});
});
