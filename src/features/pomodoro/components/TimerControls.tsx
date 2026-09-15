import type { PomodoroTimerStatus } from "../model/pomodoroTimer";

import AddMinuteButton from "./controls/AddMinuteButton";
import PictureInPictureButton from "./controls/PictureInPictureButton";
import PlayButton from "./controls/PlayButton";
import RestartCycleButton from "./controls/RestartCycleButton";
import SkipCycleButton from "./controls/SkipCycleButton";

type TimerControlsProps = {
	status: PomodoroTimerStatus;
	onAddMinute: () => void;
	onRestart: () => void;
	onStart: () => void;
	onPause: () => void;
	onSkip: () => void;
};

function TimerControls({
	status,
	onAddMinute,
	onRestart,
	onStart,
	onPause,
	onSkip,
}: TimerControlsProps) {
	const isRunning = status === "running";
	return (
		<div className="

			h-full
			w-full

			grid

			grid-cols-[minmax(0,8fr)_minmax(0,59fr)_minmax(0,8fr)]
		" >

			<div className="


				col-start-1
				h-full
				min-h-0
				min-w-0
			" />

			<div className="

				col-start-2

				min-h-0
				min-w-0

				flex

				flex-row
				justify-between

			">
				<div className="

					col-start-1

					min-w-0
					min-h-0

					grid
					grid-rows-[minmax(0,9fr)_minmax(0,38fr)_minmax(0,9fr)]
					">

						<div className="
							row-start-2
							flex
							flex-row
							gap-2
							justify-between
							items-center
						">
							<AddMinuteButton onClick={onAddMinute} />
						</div>

				</div>
				<div className="

					col-start-1

					min-w-0
					min-h-0

					grid
					grid-rows-[minmax(0,9fr)_minmax(0,38fr)_minmax(0,9fr)]
					">

						<div className="
							row-start-2
							flex
							flex-row
							gap-2
							justify-between
							items-center
						">
							<RestartCycleButton onClick={onRestart} />
						</div>

				</div>
			<div className="


					col-start-2

					min-w-0
					min-h-0

					flex
					items-center
					justify-center
					">
						<PlayButton
							isRunning={isRunning}
							onStart={onStart}
							onPause={onPause}
						/>
				</div>
				<div className="

					col-start-3

					min-w-0
					min-h-0

					grid
					grid-rows-[minmax(0,9fr)_minmax(0,38fr)_minmax(0,9fr)]
					">
						<div className="

						row-start-2

						flex
						gap-2
						flex-row
						justify-between
						items-center
						">
							<SkipCycleButton onClick={onSkip} />
						</div>

				</div>
				<div className="

					col-start-3

					min-w-0
					min-h-0

					grid
					grid-rows-[minmax(0,9fr)_minmax(0,38fr)_minmax(0,9fr)]
					">


						<div className="

						row-start-2

						flex
						gap-2
						flex-row
						justify-between
						items-center
						">
							<PictureInPictureButton />
						</div>

				</div>
			</div>

			<div className="

				col-start-3
				h-full
				min-h-0
				min-w-0
			" />

		</div>
	);
}

export default TimerControls;
