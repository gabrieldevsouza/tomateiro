import {
	MINUTE_MS,
	HOUR_MS,
	SECOND_MS,
	POMODORO_SETTINGS_LIMITS,
	isValidPomodoroSettings,
	type PomodoroSettings,
} from "./pomodoroTimer";

type SettingsField = {
	label: string;
} & (
	| { kind: "duration" }
	| { kind: "count"; min: number; max: number }
);

export const DURATION_SEGMENTS = [
	{ name: "hours", label: "horas", unit: HOUR_MS, max: Math.floor(POMODORO_SETTINGS_LIMITS.maxDurationMs / HOUR_MS) },
	{ name: "minutes", label: "minutos", unit: MINUTE_MS, max: 59 },
	{ name: "seconds", label: "segundos", unit: SECOND_MS, max: 59 },
] as const;

// These keys drive both input names and parsing; every setting must have a field.
const fields: Record<keyof PomodoroSettings, SettingsField> = {
	focusDurationMs: { label: "Foco", kind: "duration" },
	shortBreakDurationMs: { label: "Pausa curta", kind: "duration" },
	longBreakDurationMs: { label: "Pausa longa", kind: "duration" },
	focusPhasesPerCycle: {
		label: "Quantidade de focos",
		kind: "count",
		min: POMODORO_SETTINGS_LIMITS.minFocusPhases,
		max: POMODORO_SETTINGS_LIMITS.maxFocusPhases,
	},
};

export const POMODORO_SETTINGS_FIELDS = (Object.keys(fields) as (keyof PomodoroSettings)[])
	.map((name) => ({ name, ...fields[name] }));

export function readPomodoroSettingsForm(formData: FormData): PomodoroSettings | null {
	const settings = {} as PomodoroSettings;
	for (const field of POMODORO_SETTINGS_FIELDS) {
		if (field.kind === "duration") {
			let durationMs = 0;
			for (const segment of DURATION_SEGMENTS) {
				const value = formData.get(`${field.name}.${segment.name}`);
				if (typeof value !== "string" || !/^\d{1,2}$/.test(value)) return null;
				const amount = Number(value);
				if (amount > segment.max) return null;
				durationMs += amount * segment.unit;
			}
			settings[field.name] = durationMs;
		} else {
			const value = formData.get(field.name);
			if (typeof value !== "string" || value.trim() === "") return null;
			settings[field.name] = Number(value);
		}
	}
	return isValidPomodoroSettings(settings) ? settings : null;
}
