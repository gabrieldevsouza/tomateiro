export const SECOND_MS = 1_000;
export const MINUTE_MS = 60 * SECOND_MS;

export const FOCUS_DURATION_MS = 25 * MINUTE_MS;
export const SHORT_BREAK_DURATION_MS = 5 * MINUTE_MS;
export const LONG_BREAK_DURATION_MS = 15 * MINUTE_MS;
export const FOCUS_PHASES_PER_CYCLE = 4;
export const CYCLE_DURATION_MS =
	FOCUS_PHASES_PER_CYCLE * FOCUS_DURATION_MS +
	(FOCUS_PHASES_PER_CYCLE - 1) * SHORT_BREAK_DURATION_MS +
	LONG_BREAK_DURATION_MS;

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
	phase: PomodoroPhase;
	status: PomodoroTimerStatus;
	baseDurationMs: number;
	totalDurationMs: number;
	remainingMs: number;
	endsAtMs: number | null;
	completedFocusCycles: number;
	completionId: number;
	cyclePhaseIndex: number;
	cycleElapsedBeforePhaseMs: number;
	cycleTotalDurationMs: number;
}

export function createInitialPomodoroTimerState(): PomodoroTimerState{
	return{
		phase: "focus",
		status: "ready",
		baseDurationMs: FOCUS_DURATION_MS,
		totalDurationMs: FOCUS_DURATION_MS,
		remainingMs: FOCUS_DURATION_MS,
		endsAtMs: null,
		completedFocusCycles: 0,
		completionId: 0,
		cyclePhaseIndex: 0,
		cycleElapsedBeforePhaseMs: 0,
		cycleTotalDurationMs: CYCLE_DURATION_MS,
	};
}

export function getPhaseDurationMs(
	phase: PomodoroPhase,
): number{
	switch(phase){
		case "focus":
			return FOCUS_DURATION_MS;

		case "shortBreak":
			return SHORT_BREAK_DURATION_MS;

		case "longBreak":
			return LONG_BREAK_DURATION_MS;
	}
}

export function getNextPhase(
	currentPhase: PomodoroPhase,
	completedFocusCycles: number,
): PomodoroPhase{
	if (currentPhase !== "focus"){
		return "focus";
	}

	return completedFocusCycles %
		FOCUS_PHASES_PER_CYCLE === 0
		? "longBreak"
		: "shortBreak";
}

export type PomodoroTimerAction = 
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
	const durationMs = getPhaseDurationMs(phase);

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
		(state.cyclePhaseIndex + 1) % (FOCUS_PHASES_PER_CYCLE * 2);
	const nextPhase = getNextPhase(
		state.phase,
		Math.floor(state.cyclePhaseIndex / 2) + 1,
	);

	return {
		...createPhaseState(state, nextPhase),
		cyclePhaseIndex: nextPhaseIndex,
		cycleElapsedBeforePhaseMs: nextPhaseIndex === 0
			? 0
			: state.cycleElapsedBeforePhaseMs + state.totalDurationMs,
		cycleTotalDurationMs: nextPhaseIndex === 0
			? CYCLE_DURATION_MS
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

	const focusProgress = Array.from({ length: FOCUS_PHASES_PER_CYCLE }, (_, index) => {
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
			state.cycleTotalDurationMs - state.cycleElapsedBeforePhaseMs - elapsedMs,
		),
	};
}

export function pomodoroTimerReducer(
	state: PomodoroTimerState,
	action: PomodoroTimerAction,
): PomodoroTimerState {
	switch (action.type) {
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

			const remainingMs = Math.max(
				0,
				state.endsAtMs - action.nowMs,
			);

			if (remainingMs === 0) {
				return {
					...state,
					status: "completed",
					remainingMs: 0,
					endsAtMs: null,
					completedFocusCycles:
						state.phase === "focus"
							? state.completedFocusCycles + 1
							: state.completedFocusCycles,
					completionId: state.completionId + 1,
				}
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

			const remainingMs = Math.max(
				0,
				state.endsAtMs - action.nowMs,
			);

			if (remainingMs > 0) {
				return {
					...state,
					remainingMs,
				};
			}

			const completedFocusCycles =
				state.phase === "focus"
					? state.completedFocusCycles + 1
					: state.completedFocusCycles;

			return {
				...state,
				status: "completed",
				remainingMs: 0,
				endsAtMs: null,
				completedFocusCycles,
				completionId: state.completionId + 1,
			};
		}

		case "addMinute": {
			if (state.status === "completed") {
				return state;
			}

			return {
				...state,
				cycleTotalDurationMs: state.cycleTotalDurationMs + MINUTE_MS,
				totalDurationMs:
					state.totalDurationMs +
					MINUTE_MS,
				remainingMs:
					state.remainingMs +
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
