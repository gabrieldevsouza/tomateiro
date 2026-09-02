import AddMinuteButton from "./controls/AddMinuteButton";
import PictureInPictureButton from "./controls/PictureInPictureButton";
import PlayButton from "./controls/PlayButton";
import RestartCycleButton from "./controls/RestartCycleButton";
import SkipCycleButton from "./controls/SkipCycleButton";

type TimerControlsProps = {
	onAddMinute: () => void;
	onRestart: () => void;
	onStart: () => void;
	onSkip: () => void;
};

function TimerControls({
	onAddMinute,
	onRestart,
	onStart,
	onSkip,
}: TimerControlsProps) {

	return (
		<div className="
			bg-green-500

			h-full
			w-full

			grid

			grid-cols-[minmax(0,4fr)_minmax(0,7fr)_minmax(0,4fr)]
		" >

			<div className="
				bg-fuchsia-500

				col-start-1
				h-full
				min-h-0
				min-w-0
			" />

			<div className="
				bg-blue-400

				col-start-2
				grid
				h-full
				min-h-0
				min-w-0
				grid-cols-5
			">
				<AddMinuteButton onClick={onAddMinute} />
				<RestartCycleButton onClick={onRestart} />
				<PlayButton onClick={onStart} />
				<SkipCycleButton onClick={onSkip} />
				<PictureInPictureButton />
			</div>

			<div className="
				bg-emerald-400

				col-start-3
				h-full
				min-h-0
				min-w-0
			" />

		</div>
	);
}

export default TimerControls;
