import CycleCounter from "./components/CycleCounter";
import ProgressIndicator from "./components/ProgressIndicator";
import TimerControls from "./components/TimerControls";
import TimerDisplay from "./components/TimerDisplay";
import TimerSettingsDialog from "./components/dialogs/TimerSettingsDialog";
import EditTimerButton from "./components/controls/EditTimerButton";

import {
	createInitialPomodoroTimerState,
	getPomodoroCycleProgress,
	pomodoroTimerReducer,
	type PomodoroPhase,
} from "./model/pomodoroTimer";

import { useEffect, useReducer, useState } from "react";

const phaseLabels: Record<PomodoroPhase, string> = {
	focus: "Foco",
	shortBreak: "Pausa curta",
	longBreak: "Pausa longa",
};

function PomodoroPanel() {
	const [isEditing, setIsEditing] = useState(false);
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

	return (
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
					<CycleCounter focusProgress={cycleProgress.focusProgress} />
				</div>

				<div className="
					row-start-3
					min-h-0
					min-w-0
				">
					<TimerDisplay remainingMs={timerState.remainingMs} />
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
			{/* The edit control occupies the existing bottom grid row. */}
			<div className="row-start-3 col-start-2 flex min-h-0 min-w-0 items-center justify-center overflow-clip">
				<div className="aspect-square h-[40%]">
					<EditTimerButton onClick={() => setIsEditing(true)} />
				</div>
			</div>
			{isEditing && (
				<TimerSettingsDialog
					onClose={() => setIsEditing(false)}
				/>
			)}
		</div>
	);
}

export default PomodoroPanel;
