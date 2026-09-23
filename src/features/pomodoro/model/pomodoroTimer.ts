export const SECOND_MS = 1_000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;

export const FOCUS_DURATION_MS = 25 * MINUTE_MS;
export const SHORT_BREAK_DURATION_MS = 5 * MINUTE_MS;
export const LONG_BREAK_DURATION_MS = 15 * MINUTE_MS;
export const FOCUS_PHASES_PER_CYCLE = 4;

export type PomodoroSettings = {
	focusDurationMs: number;
	shortBreakDurationMs: number;
	longBreakDurationMs: number;
	focusPhasesPerCycle: number;
};

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
	focusDurationMs: FOCUS_DURATION_MS,
	shortBreakDurationMs: SHORT_BREAK_DURATION_MS,
	longBreakDurationMs: LONG_BREAK_DURATION_MS,
	focusPhasesPerCycle: FOCUS_PHASES_PER_CYCLE,
};

export const POMODORO_SETTINGS_LIMITS = {
	minDurationMs: SECOND_MS,
	maxDurationMs: 99 * HOUR_MS,
	minFocusPhases: 1,
	maxFocusPhases: 12,
} as const;

export function isValidPomodoroSettings(settings: PomodoroSettings): boolean {
	const durations = [
		settings.focusDurationMs,
		settings.shortBreakDurationMs,
		settings.longBreakDurationMs,
	];
	return durations.every((durationMs) => {
		return Number.isInteger(durationMs / SECOND_MS) &&
			durationMs >= POMODORO_SETTINGS_LIMITS.minDurationMs &&
			durationMs <= POMODORO_SETTINGS_LIMITS.maxDurationMs;
	}) && Number.isInteger(settings.focusPhasesPerCycle) &&
		settings.focusPhasesPerCycle >= POMODORO_SETTINGS_LIMITS.minFocusPhases &&
		settings.focusPhasesPerCycle <= POMODORO_SETTINGS_LIMITS.maxFocusPhases;
}

export function getCycleDurationMs(settings: PomodoroSettings): number {
	return settings.focusPhasesPerCycle * settings.focusDurationMs +
		(settings.focusPhasesPerCycle - 1) * settings.shortBreakDurationMs +
		settings.longBreakDurationMs;
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
		baseDurationMs: settings.focusDurationMs,
		totalDurationMs: settings.focusDurationMs,
		remainingMs: settings.focusDurationMs,
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
	switch(phase){
		case "focus":
			return settings.focusDurationMs;

		case "shortBreak":
			return settings.shortBreakDurationMs;

		case "longBreak":
			return settings.longBreakDurationMs;
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
				state.settings.focusDurationMs === action.settings.focusDurationMs &&
				state.settings.shortBreakDurationMs === action.settings.shortBreakDurationMs &&
				state.settings.longBreakDurationMs === action.settings.longBreakDurationMs &&
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
