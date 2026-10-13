import CycleSteps from "./components/CycleSteps";
import ProgressIndicator from "./components/ProgressIndicator";
import TimerControls from "./components/TimerControls";
import TimerDisplay, { type TimerDisplayMode } from "./components/TimerDisplay";
import TimerSettingsDialog from "./components/dialogs/TimerSettingsDialog";

import {
	createInitialPomodoroTimerState,
	canAddPomodoroMinute,
	getPomodoroCycleProgress,
	pomodoroTimerReducer,
	isValidPomodoroSettings,
	type PomodoroPhase,
	type PomodoroSettings,
	type PomodoroTimerAction,
} from "./model/pomodoroTimer";

import { useEffect, useReducer } from "react";

// Choose "digital" for instant updates or "countdown" for animated digits.
const TIMER_DISPLAY_MODE: TimerDisplayMode = "countdown";

const phaseLabels: Record<PomodoroPhase, string> = {
	focus: "Foco",
	shortBreak: "Pausa curta",
	longBreak: "Pausa longa",
};

type PomodoroPanelProps = {
	isEditing: boolean;
	onCloseEditor: () => void;
};

function PomodoroPanel({ isEditing, onCloseEditor }: PomodoroPanelProps) {
	const [timerState, dispatch] = useReducer(
		pomodoroTimerReducer,
		undefined,
		createInitialPomodoroTimerState,
	);
	// Only user actions request a short catch-up; millisecond ticks keep their natural motion.
	const [progressTransitionId, requestProgressTransition] = useReducer((id: number) => id + 1, 0);
	const cycleProgress = getPomodoroCycleProgress(timerState);

	function dispatchWithProgressTransition(action: PomodoroTimerAction) {
		dispatch(action);
		if (pomodoroTimerReducer(timerState, action) !== timerState) requestProgressTransition();
	}

	useEffect(() => {
		if (timerState.status !== "running") {
			return;
		}

		function tick() {
			dispatch({
				type: "tick",
				nowMs: performance.now(),
			});
		}
		// Request 1 ms updates; browser scheduling may clamp or delay callbacks.
		const intervalId = window.setInterval(tick, 1);
		document.addEventListener("visibilitychange", tick);

		return () => {
			window.clearInterval(intervalId);
			document.removeEventListener("visibilitychange", tick);
		};
	}, [timerState.status]);

	function handleSaveSettings(settings: PomodoroSettings) {
		if (!isValidPomodoroSettings(settings)) return;
		// Account for a deadline reached since the last display tick before replacing the block.
		dispatch({ type: "tick", nowMs: performance.now() });
		dispatchWithProgressTransition({ type: "configure", settings });
		onCloseEditor();
	}

	return (
		<>
		<div className="grid aspect-8/9 w-[min(100cqw,88.8889cqh)] grid-cols-[minmax(0,3fr)_minmax(0,10fr)_minmax(0,3fr)] grid-rows-[minmax(0,1fr)_minmax(0,4fr)_minmax(0,1fr)]">
			<div
				className="
					row-start-2
					col-start-2
					relative
					grid
					h-full
					w-full
					min-h-0
					min-w-0
					grid-rows-[minmax(0,18fr)_minmax(0,25fr)_minmax(0,46fr)_minmax(0,25fr)_minmax(0,13fr)_minmax(0,25fr)_minmax(0,28fr)]
				"
			>
				<div className="absolute inset-x-0 bottom-full h-[12.5%] @container-size">
					<p
						className="flex h-full items-center justify-center whitespace-nowrap font-[Epilogue] text-[#00CBEA] leading-none"
						style={{ fontSize: "min(7cqw,40cqh)" }}
						aria-live="polite"
					>
						{phaseLabels[timerState.phase]}
					</p>
				</div>

				<div className="
					row-start-1
					min-h-0
					min-w-0
				">
					<CycleSteps
						focusProgress={cycleProgress.focusProgress}
						currentFocusIndex={Math.floor(timerState.cyclePhaseIndex / 2)}
						isCurrentFocusComplete={timerState.phase !== "focus" || timerState.status === "completed"}
						transitionId={progressTransitionId}
						phase={timerState.phase}
						phaseDurationMs={timerState.totalDurationMs}
						phaseRemainingMs={timerState.remainingMs}
						endsAtMs={timerState.endsAtMs}
					/>
				</div>

				<div className="
					row-start-3
					min-h-0
					min-w-0
				">
					<TimerDisplay remainingMs={timerState.remainingMs} mode={TIMER_DISPLAY_MODE} />
				</div>

				<div className="
					row-start-5
					min-h-0
					min-w-0
				">
					<ProgressIndicator
						totalDurationMs={cycleProgress.totalDurationMs}
						remainingMs={cycleProgress.remainingMs}
						phaseDurationMs={timerState.totalDurationMs}
						cycleAccountedBeforePhaseMs={timerState.cycleAccountedBeforePhaseMs}
						endsAtMs={timerState.endsAtMs}
						transitionId={progressTransitionId}
					/>
				</div>

				<div className="
					row-start-7
					min-h-0
					min-w-0
				">
					<TimerControls
						status={timerState.status}
						canAddMinute={canAddPomodoroMinute(timerState)}
						onAddMinute={() => {
							dispatchWithProgressTransition({ type: "addMinute", nowMs: performance.now() });
						}}
						onRestart={() => {
							dispatchWithProgressTransition({ type: "restart" });
						}}
						onStart={() => {
							const start = timerState.status === "completed" ? dispatchWithProgressTransition : dispatch;
							start({
								type: "start",
								nowMs: performance.now(),
							});
						}}
						onPause={() => {
							dispatch({
								type: "pause",
								nowMs: performance.now(),
							});
						}}
						onSkip={() => {
							dispatchWithProgressTransition({ type: "skip" });
						}}
					/>
				</div>
			</div>
		</div>
		{isEditing && (
			<TimerSettingsDialog
				settings={timerState.settings}
				onSave={handleSaveSettings}
				onClose={onCloseEditor}
			/>
		)}
		</>
	);
}

export default PomodoroPanel;
