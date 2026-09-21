import {
	MINUTE_MS,
	POMODORO_SETTINGS_LIMITS,
	isValidPomodoroSettings,
	type PomodoroSettings,
} from "./pomodoroTimer";

type SettingsField = {
	label: string;
	unit: number;
	min: number;
	max: number;
};

const minuteLimits = {
	unit: MINUTE_MS,
	min: POMODORO_SETTINGS_LIMITS.minMinutes,
	max: POMODORO_SETTINGS_LIMITS.maxMinutes,
};

// These keys drive both input names and parsing; every setting must have a field.
const fields: Record<keyof PomodoroSettings, SettingsField> = {
	focusDurationMs: { label: "Foco (min)", ...minuteLimits },
	shortBreakDurationMs: { label: "Pausa curta (min)", ...minuteLimits },
	longBreakDurationMs: { label: "Pausa longa (min)", ...minuteLimits },
	focusPhasesPerCycle: {
		label: "Quantidade de focos",
		unit: 1,
		min: POMODORO_SETTINGS_LIMITS.minFocusPhases,
		max: POMODORO_SETTINGS_LIMITS.maxFocusPhases,
	},
};

export const POMODORO_SETTINGS_FIELDS = (Object.keys(fields) as (keyof PomodoroSettings)[])
	.map((name) => ({ name, ...fields[name] }));

export function readPomodoroSettingsForm(formData: FormData): PomodoroSettings | null {
	const settings = {} as PomodoroSettings;
	for (const field of POMODORO_SETTINGS_FIELDS) {
		const value = formData.get(field.name);
		if (typeof value !== "string" || value.trim() === "") {
			return null;
		}
		settings[field.name] = Number(value) * field.unit;
	}
	return isValidPomodoroSettings(settings) ? settings : null;
}
