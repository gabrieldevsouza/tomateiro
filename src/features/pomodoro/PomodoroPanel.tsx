import CycleCounter from "./components/CycleCounter";
import ProgressIndicator from "./components/ProgressIndicator";
import TimerControls from "./components/TimerControls";
import TimerDisplay from "./components/TimerDisplay";

function PomodoroPanel() {
	return (
		<div
			className="
				grid
				h-full
				w-full
				min-h-0
				min-w-0
				grid-rows-[minmax(0,18fr)_minmax(0,25fr)_minmax(0,46fr)_minmax(0,25fr)_minmax(0,13fr)_minmax(0,25fr)_minmax(0,28fr)]
				bg-red-400
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
				<TimerDisplay />
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
				<TimerControls />
			</div>
		</div>
	);
}

export default PomodoroPanel;
