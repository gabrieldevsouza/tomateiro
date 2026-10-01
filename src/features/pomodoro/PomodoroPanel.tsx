import CycleCounter from "./components/CycleCounter";
import ProgressIndicator from "./components/ProgressIndicator";
import TimerControls from "./components/TimerControls";
import TimerDisplay, { type TimerDisplayMode } from "./components/TimerDisplay";

import {
	createInitialPomodoroTimerState,
	getPomodoroCycleProgress,
	pomodoroTimerReducer,
	type PomodoroPhase,
} from "./model/pomodoroTimer";

import { useEffect, useReducer } from "react";

// Choose "digital" for instant updates or "countdown" for animated digits.
const TIMER_DISPLAY_MODE: TimerDisplayMode = "countdown";

const phaseLabels: Record<PomodoroPhase, string> = {
	focus: "Foco",
	shortBreak: "Pausa curta",
	longBreak: "Pausa longa",
};

function PomodoroPanel() {
	const [timerState, dispatch] = useReducer(
		pomodoroTimerReducer,
		undefined,
		createInitialPomodoroTimerState,
	);
	const cycleProgress = getPomodoroCycleProgress(timerState);

	useEffect(() => {
		if (timerState.status !== "running") {
			return;
		}

		const intervalId = window.setInterval(() => {
			dispatch({
				type: "tick",
				nowMs: performance.now(),
			});
		}, 250);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [timerState.status]);

	// Inner tracks grow from 180 to 198 units; 2:11:2 keeps each unit at H/270.
	return (
		<div className="grid aspect-8/9 w-[min(100cqw,88.8889cqh)] grid-cols-[minmax(0,3fr)_minmax(0,10fr)_minmax(0,3fr)] grid-rows-[minmax(0,2fr)_minmax(0,11fr)_minmax(0,2fr)]">
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
					grid-rows-[minmax(0,36fr)_minmax(0,25fr)_minmax(0,46fr)_minmax(0,25fr)_minmax(0,13fr)_minmax(0,25fr)_minmax(0,28fr)]
				"
			>
				<div className="absolute inset-x-0 bottom-full h-[calc(100%*5/44)] @container-size">
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
					<CycleCounter focusProgress={cycleProgress.focusProgress} />
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
					/>
				</div>

				<div className="
					row-start-7
					min-h-0
					min-w-0
				">
					<TimerControls
						status={timerState.status}
						onAddMinute={() => {
							dispatch({ type: "addMinute", nowMs: performance.now() });
						}}
						onRestart={() => {
							dispatch({ type: "restart" });
						}}
						onStart={() => {
							dispatch({
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
							dispatch({ type: "skip" });
						}}
					/>
				</div>
			</div>
		</div>
	);
}

export default PomodoroPanel;
