export const SECOND_MS = 1_000;
export const MINUTE_SECONDS = 60;
export const HOUR_SECONDS = 60 * MINUTE_SECONDS;
export const MINUTE_MS = MINUTE_SECONDS * SECOND_MS;
export const HOUR_MS = HOUR_SECONDS * SECOND_MS;

export const FOCUS_DURATION_SECONDS = 25 * MINUTE_SECONDS;
export const SHORT_BREAK_DURATION_SECONDS = 5 * MINUTE_SECONDS;
export const LONG_BREAK_DURATION_SECONDS = 15 * MINUTE_SECONDS;
export const FOCUS_DURATION_MS = FOCUS_DURATION_SECONDS * SECOND_MS;
export const SHORT_BREAK_DURATION_MS = SHORT_BREAK_DURATION_SECONDS * SECOND_MS;
export const LONG_BREAK_DURATION_MS = LONG_BREAK_DURATION_SECONDS * SECOND_MS;
export const FOCUS_PHASES_PER_CYCLE = 4;

export type PomodoroSettings = {
	focusDurationSeconds: number;
	shortBreakDurationSeconds: number;
	longBreakDurationSeconds: number;
	focusPhasesPerCycle: number;
};

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
	focusDurationSeconds: FOCUS_DURATION_SECONDS,
	shortBreakDurationSeconds: SHORT_BREAK_DURATION_SECONDS,
	longBreakDurationSeconds: LONG_BREAK_DURATION_SECONDS,
	focusPhasesPerCycle: FOCUS_PHASES_PER_CYCLE,
};

export const POMODORO_SETTINGS_LIMITS = {
	minDurationSeconds: 1,
	maxDurationSeconds: 99 * HOUR_SECONDS + 59 * MINUTE_SECONDS + 59,
	minFocusPhases: 1,
	maxFocusPhases: 12,
} as const;

export function isValidPomodoroSettings(settings: unknown): settings is PomodoroSettings {
	if (typeof settings !== "object" || settings === null || Array.isArray(settings)) {
		return false;
	}
	const values = settings as Record<string, unknown>;
	const names = ["focusDurationSeconds", "shortBreakDurationSeconds", "longBreakDurationSeconds", "focusPhasesPerCycle"];
	if (Object.keys(values).length !== names.length || names.some((name) => !Object.prototype.hasOwnProperty.call(values, name))) {
		return false;
	}
	const durations = [
		values.focusDurationSeconds,
		values.shortBreakDurationSeconds,
		values.longBreakDurationSeconds,
	];
	return durations.every((durationSeconds) => {
		return typeof durationSeconds === "number" && Number.isInteger(durationSeconds) &&
			durationSeconds >= POMODORO_SETTINGS_LIMITS.minDurationSeconds &&
			durationSeconds <= POMODORO_SETTINGS_LIMITS.maxDurationSeconds;
	}) && typeof values.focusPhasesPerCycle === "number" && Number.isInteger(values.focusPhasesPerCycle) &&
		values.focusPhasesPerCycle >= POMODORO_SETTINGS_LIMITS.minFocusPhases &&
		values.focusPhasesPerCycle <= POMODORO_SETTINGS_LIMITS.maxFocusPhases;
}

export function getCycleDurationMs(settings: PomodoroSettings): number {
	if (!isValidPomodoroSettings(settings)) {
		throw new RangeError("Configuração do Pomodoro inválida.");
	}
	return (settings.focusPhasesPerCycle * settings.focusDurationSeconds +
		(settings.focusPhasesPerCycle - 1) * settings.shortBreakDurationSeconds +
		settings.longBreakDurationSeconds) * SECOND_MS;
}

export type PomodoroPhase = 
	| "focus"
	| "shortBreak"
	| "longBreak";

export type PomodoroTimerStatus = 
	| "ready"
	| "running"
	| "paused"
	| "completed";

export type PomodoroTimerState = {
	settings: PomodoroSettings;
	phase: PomodoroPhase;
	status: PomodoroTimerStatus;
	baseDurationMs: number;
	totalDurationMs: number;
	remainingMs: number;
	// Deadline on the same monotonic clock supplied by action.nowMs.
	endsAtMs: number | null;
	completedFocusCount: number;
	completionId: number;
	cyclePhaseIndex: number;
	// Includes the full duration of skipped phases, as well as completed phases.
	cycleAccountedBeforePhaseMs: number;
	cycleTotalDurationMs: number;
}

export function createInitialPomodoroTimerState(
	settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS,
): PomodoroTimerState{
	if (!isValidPomodoroSettings(settings)) {
		throw new RangeError("Configuração do Pomodoro inválida.");
	}
	return{
		settings: { ...settings },
		phase: "focus",
		status: "ready",
		baseDurationMs: settings.focusDurationSeconds * SECOND_MS,
		totalDurationMs: settings.focusDurationSeconds * SECOND_MS,
		remainingMs: settings.focusDurationSeconds * SECOND_MS,
		endsAtMs: null,
		completedFocusCount: 0,
		completionId: 0,
		cyclePhaseIndex: 0,
		cycleAccountedBeforePhaseMs: 0,
		cycleTotalDurationMs: getCycleDurationMs(settings),
	};
}

export function getPhaseDurationMs(
	phase: PomodoroPhase,
	settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS,
): number{
	if (!isValidPomodoroSettings(settings)) {
		throw new RangeError("Configuração do Pomodoro inválida.");
	}
	switch(phase){
		case "focus":
			return settings.focusDurationSeconds * SECOND_MS;

		case "shortBreak":
			return settings.shortBreakDurationSeconds * SECOND_MS;

		case "longBreak":
			return settings.longBreakDurationSeconds * SECOND_MS;
	}
}

export function getNextPhase(
	currentPhase: PomodoroPhase,
	focusNumberInCycle: number,
	focusPhasesPerCycle = FOCUS_PHASES_PER_CYCLE,
): PomodoroPhase{
	if (currentPhase !== "focus"){
		return "focus";
	}

	return focusNumberInCycle %
		focusPhasesPerCycle === 0
		? "longBreak"
		: "shortBreak";
}

export type PomodoroTimerAction = 
	| {
		type: "configure";
		settings: PomodoroSettings;
	}

	| {
		type: "start";
		nowMs: number;
	}

	| {
		type: "pause";
		nowMs: number;
	}

	| {
		type: "tick";
		nowMs: number;
	}

	| {
		type: "addMinute";
		nowMs: number;
	}

	| {
		type: "restart";
	}

	| {
		type: "skip";
	};


function createPhaseState(
	state: PomodoroTimerState,
	phase: PomodoroPhase,
): PomodoroTimerState{
	const durationMs = getPhaseDurationMs(phase, state.settings);

	return{
		...state,
		phase,
		status: "ready",
		baseDurationMs: durationMs,
		totalDurationMs: durationMs,
		remainingMs: durationMs,
		endsAtMs: null,
	};
}

function advancePhase(
	state: PomodoroTimerState,
): PomodoroTimerState{
	const nextPhaseIndex =
		(state.cyclePhaseIndex + 1) % (state.settings.focusPhasesPerCycle * 2);
	const nextPhase = getNextPhase(
		state.phase,
		Math.floor(state.cyclePhaseIndex / 2) + 1,
		state.settings.focusPhasesPerCycle,
	);

	return {
		...createPhaseState(state, nextPhase),
		cyclePhaseIndex: nextPhaseIndex,
		cycleAccountedBeforePhaseMs: nextPhaseIndex === 0
			? 0
			: state.cycleAccountedBeforePhaseMs + state.totalDurationMs,
		cycleTotalDurationMs: nextPhaseIndex === 0
			? getCycleDurationMs(state.settings)
			: state.cycleTotalDurationMs,
	};
}

export function getPomodoroCycleProgress(state: PomodoroTimerState) {
	const elapsedMs = Math.max(
		0,
		Math.min(state.totalDurationMs, state.totalDurationMs - state.remainingMs),
	);
	const phaseProgress = state.totalDurationMs > 0
		? (elapsedMs / state.totalDurationMs) * 100
		: 0;
	const currentFocusIndex = Math.floor(state.cyclePhaseIndex / 2);

	const focusProgress = Array.from({ length: state.settings.focusPhasesPerCycle }, (_, index) => {
		if (index < currentFocusIndex) {
			return 100;
		}
		if (index > currentFocusIndex) {
			return 0;
		}
		return state.phase === "focus" ? phaseProgress : 100;
	});

	return {
		focusProgress,
		totalDurationMs: state.cycleTotalDurationMs,
		remainingMs: Math.max(
			0,
			state.cycleTotalDurationMs - state.cycleAccountedBeforePhaseMs - elapsedMs,
		),
	};
}

export function getProgressPercentage(totalDurationMs: number, remainingMs: number): number {
	if (totalDurationMs <= 0) {
		return 0;
	}
	if (remainingMs <= 0) {
		return 100;
	}
	const percentage = ((totalDurationMs - remainingMs) / totalDurationMs) * 100;
	// Rounded values must not announce completion while time remains.
	return Math.max(0, Math.min(99, Math.round(percentage)));
}

function completeCurrentPhase(state: PomodoroTimerState): PomodoroTimerState {
	if (state.status === "completed") {
		return state;
	}
	return {
		...state,
		status: "completed",
		remainingMs: 0,
		endsAtMs: null,
		completedFocusCount: state.completedFocusCount + (state.phase === "focus" ? 1 : 0),
		completionId: state.completionId + 1,
	};
}

function getRunningRemainingMs(state: PomodoroTimerState, nowMs: number): number {
	if (state.endsAtMs === null) {
		return state.remainingMs;
	}
	// A delayed/out-of-order timestamp must never add time to a running phase.
	return Math.max(0, Math.min(state.remainingMs, state.endsAtMs - nowMs));
}

export function canAddPomodoroMinute(state: PomodoroTimerState): boolean {
	return state.status !== "completed" &&
		state.totalDurationMs <= POMODORO_SETTINGS_LIMITS.maxDurationSeconds * SECOND_MS - MINUTE_MS;
}

export function pomodoroTimerReducer(
	state: PomodoroTimerState,
	action: PomodoroTimerAction,
): PomodoroTimerState {
	switch (action.type) {
		case "configure": {
			if (!isValidPomodoroSettings(action.settings)) {
				return state;
			}
			if (
				state.settings.focusDurationSeconds === action.settings.focusDurationSeconds &&
				state.settings.shortBreakDurationSeconds === action.settings.shortBreakDurationSeconds &&
				state.settings.longBreakDurationSeconds === action.settings.longBreakDurationSeconds &&
				state.settings.focusPhasesPerCycle === action.settings.focusPhasesPerCycle
			) {
				return state;
			}
			return {
				...createInitialPomodoroTimerState(action.settings),
				completedFocusCount: state.completedFocusCount,
				completionId: state.completionId,
			};
		}

		case "start": {
			if (state.status === "running") {
				return state;
			}

			const nextState =
				state.status === "completed"
					? advancePhase(state)
					: state;

			return {
				...nextState,
				status: "running",
				endsAtMs:
					action.nowMs +
					nextState.remainingMs,
			};
		}

		case "pause": {
			if (
				state.status !== "running" ||
				state.endsAtMs === null
			) {
				return state;
			}

			const remainingMs = getRunningRemainingMs(state, action.nowMs);

			if (remainingMs === 0) {
				return completeCurrentPhase(state);
			}

			return {
				...state,
				status: "paused",
				remainingMs,
				endsAtMs: null,
			};
		}

		case "tick": {
			if (
				state.status !== "running" ||
				state.endsAtMs === null
			) {
				return state;
			}

			const remainingMs = getRunningRemainingMs(state, action.nowMs);

			if (remainingMs > 0) {
				return {
					...state,
					remainingMs,
				};
			}

			return completeCurrentPhase(state);
		}

		case "addMinute": {
			if (state.status === "completed") {
				return state;
			}
			const remainingMs = state.status === "running" && state.endsAtMs !== null
				? getRunningRemainingMs(state, action.nowMs)
				: state.remainingMs;
			// The click timestamp decides expiry, even between interval updates.
			if (remainingMs === 0) {
				return completeCurrentPhase(state);
			}

			if (!canAddPomodoroMinute(state)) {
				return remainingMs === state.remainingMs ? state : { ...state, remainingMs };
			}

			return {
				...state,
				cycleTotalDurationMs: state.cycleTotalDurationMs + MINUTE_MS,
				totalDurationMs:
					state.totalDurationMs +
					MINUTE_MS,
				remainingMs:
					remainingMs +
					MINUTE_MS,
				endsAtMs:
					state.endsAtMs === null
						? null
						: state.endsAtMs +
							MINUTE_MS,
			};
		}

		case "restart": {
			return {
				...createPhaseState(state, state.phase),
				cycleTotalDurationMs: state.cycleTotalDurationMs -
					(state.totalDurationMs - state.baseDurationMs),
			};
		}

		case "skip": {
			return advancePhase(state);
		}
	}
}
