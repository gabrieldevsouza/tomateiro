import CycleCounter from "./components/CycleCounter";
import ProgressIndicator from "./components/ProgressIndicator";
import TimerControls from "./components/TimerControls";
import TimerDisplay from "./components/TimerDisplay";

import {
	createInitialPomodoroTimerState,
	pomodoroTimerReducer,
} from "./model/pomodoroTimer";

import { useEffect, useReducer } from "react";

function PomodoroPanel() {
	const [timerState, dispatch] = useReducer(
		pomodoroTimerReducer,
		undefined,
		createInitialPomodoroTimerState,
	);

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
				grid
				h-full
				w-full
				min-h-0
				min-w-0
				grid-rows-[minmax(0,18fr)_minmax(0,25fr)_minmax(0,46fr)_minmax(0,25fr)_minmax(0,13fr)_minmax(0,25fr)_minmax(0,28fr)]
			"
		>
			<div className="
				row-start-1
				min-h-0
				min-w-0
			">
				<CycleCounter />
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
				<ProgressIndicator />
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
