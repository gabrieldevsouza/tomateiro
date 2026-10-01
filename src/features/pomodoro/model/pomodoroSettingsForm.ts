import {
	MINUTE_SECONDS,
	HOUR_SECONDS,
	POMODORO_SETTINGS_LIMITS,
	isValidPomodoroSettings,
	type PomodoroSettings,
} from "./pomodoroTimer";

export type PomodoroDurationSettingName = Exclude<keyof PomodoroSettings, "focusPhasesPerCycle">;

type SettingsField = {
	label: string;
} & (
	| { kind: "duration" }
	| { kind: "count"; min: number; max: number }
);

// Units are seconds, matching the canonical configuration rather than the runtime clock.
export const DURATION_SEGMENTS = [
	{ name: "hours", label: "horas", unit: HOUR_SECONDS, max: 99 },
	{ name: "minutes", label: "minutos", unit: MINUTE_SECONDS, max: 59 },
	{ name: "seconds", label: "segundos", unit: 1, max: 59 },
] as const;

// These keys drive both input names and parsing; every setting must have a field.
const fields: Record<keyof PomodoroSettings, SettingsField> = {
	focusDurationSeconds: { label: "Temporizador", kind: "duration" },
	shortBreakDurationSeconds: { label: "Pausa curta", kind: "duration" },
	longBreakDurationSeconds: { label: "Pausa longa", kind: "duration" },
	focusPhasesPerCycle: {
		label: "Ciclos",
		kind: "count",
		min: POMODORO_SETTINGS_LIMITS.minFocusPhases,
		max: POMODORO_SETTINGS_LIMITS.maxFocusPhases,
	},
};

export const POMODORO_SETTINGS_FIELDS = (Object.keys(fields) as (keyof PomodoroSettings)[])
	.map((name) => ({ name, ...fields[name] }));

export type PomodoroSettingsFormError = {
	field: keyof PomodoroSettings;
	inputName: string;
	message: string;
};

export type PomodoroSettingsFormResult =
	| { ok: true; settings: PomodoroSettings }
	| { ok: false; errors: PomodoroSettingsFormError[] };

export function getPomodoroDurationSegments(durationSeconds: number) {
	if (!Number.isInteger(durationSeconds) || durationSeconds < POMODORO_SETTINGS_LIMITS.minDurationSeconds ||
		durationSeconds > POMODORO_SETTINGS_LIMITS.maxDurationSeconds) {
		throw new RangeError("Duração do Pomodoro inválida.");
	}
	return {
		hours: String(Math.floor(durationSeconds / HOUR_SECONDS)),
		minutes: String(Math.floor(durationSeconds / MINUTE_SECONDS) % 60),
		seconds: String(durationSeconds % 60),
	};
}

export function parsePomodoroSettingsForm(formData: FormData): PomodoroSettingsFormResult {
	const settings = {} as PomodoroSettings;
	const errors: PomodoroSettingsFormError[] = [];
	for (const field of POMODORO_SETTINGS_FIELDS) {
		if (field.kind === "duration") {
			const amounts: number[] = [];
			for (const segment of DURATION_SEGMENTS) {
				const inputName = `${field.name}.${segment.name}`;
				const values = formData.getAll(inputName);
				const value = values[0];
				if (values.length !== 1 || typeof value !== "string" || !/^\d{1,2}$/.test(value)) {
					errors.push({ field: field.name, inputName, message: `${field.label}: preencha ${segment.label} com um número inteiro de 0 a ${segment.max}.` });
					continue;
				}
				const amount = Number(value);
				if (amount > segment.max) {
					errors.push({ field: field.name, inputName, message: `${field.label}: use ${segment.label} de 0 a ${segment.max}.` });
					continue;
				}
				amounts.push(amount);
			}
			// Do not carry an invalid segment into another unit before validating it.
			if (amounts.length !== DURATION_SEGMENTS.length) continue;
			const durationSeconds = amounts.reduce((total, amount, index) => total + amount * DURATION_SEGMENTS[index].unit, 0);
			if (durationSeconds < POMODORO_SETTINGS_LIMITS.minDurationSeconds || durationSeconds > POMODORO_SETTINGS_LIMITS.maxDurationSeconds) {
				errors.push({ field: field.name, inputName: `${field.name}.hours`, message: `${field.label}: use uma duração de 00:00:01 a 99:59:59.` });
			} else settings[field.name] = durationSeconds;
		} else {
			const values = formData.getAll(field.name);
			const value = values[0];
			if (values.length !== 1 || typeof value !== "string" || !/^\d{1,2}$/.test(value) || Number(value) < field.min || Number(value) > field.max) {
				errors.push({ field: field.name, inputName: field.name, message: `${field.label}: use um número inteiro de ${field.min} a ${field.max}.` });
			} else settings[field.name] = Number(value);
		}
	}
	if (errors.length > 0) return { ok: false, errors };
	if (!isValidPomodoroSettings(settings)) {
		return { ok: false, errors: [{ field: "focusDurationSeconds", inputName: "focusDurationSeconds.hours", message: "Configuração do Pomodoro inválida." }] };
	}
	return { ok: true, settings };
}

export function readPomodoroSettingsForm(formData: FormData): PomodoroSettings | null {
	const result = parsePomodoroSettingsForm(formData);
	return result.ok ? result.settings : null;
}
