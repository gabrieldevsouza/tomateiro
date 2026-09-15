import CycleCounter from "./components/CycleCounter";
import ProgressIndicator from "./components/ProgressIndicator";
import TimerControls from "./components/TimerControls";
import TimerDisplay from "./components/TimerDisplay";

import {
	createInitialPomodoroTimerState,
	getPomodoroCycleProgress,
	pomodoroTimerReducer,
	type PomodoroPhase,
} from "./model/pomodoroTimer";

import { useEffect, useReducer } from "react";

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
				nowMs: Date.now(),
			});
		}, 250);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [timerState.status]);

	return (
		<div
			className="
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
                        dispatch({ type: "addMinute" });
                    }}
                    onRestart={() => {
                        dispatch({ type: "restart" });
                    }}
                    onStart={() => {
                        dispatch({
                            type: "start",
                            nowMs: Date.now(),
                        });
                    }}
                    onPause={() => {
                        dispatch({
                            type: "pause",
                            nowMs: Date.now(),
                        });
                    }}
                    onSkip={() => {
                        dispatch({ type: "skip" });
                    }}
                />
			</div>
		</div>
	);
}

export default PomodoroPanel;
