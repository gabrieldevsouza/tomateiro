import type { ReactNode } from "react";
import type { PomodoroTimerStatus } from "../model/pomodoroTimer";

import AddMinuteButton from "./controls/AddMinuteButton";
import PictureInPictureButton from "./controls/PictureInPictureButton";
import PlayButton from "./controls/PlayButton";
import RestartCycleButton from "./controls/RestartCycleButton";
import SkipCycleButton from "./controls/SkipCycleButton";

type TimerControlsProps = {
	status: PomodoroTimerStatus;
	canAddMinute: boolean;
	onAddMinute: () => void;
	onRestart: () => void;
	onStart: () => void;
	onPause: () => void;
	onSkip: () => void;
};

function SecondaryControlSlot({ children }: { children: ReactNode }) {
	return (
		<div className="min-w-0 min-h-0 grid grid-rows-[minmax(0,9fr)_minmax(0,38fr)_minmax(0,9fr)]">
			<div className="row-start-2 flex flex-row gap-2 justify-between items-center">
				{children}
			</div>
		</div>
	);
}

function TimerControls({
	status,
	canAddMinute,
	onAddMinute,
	onRestart,
	onStart,
	onPause,
	onSkip,
}: TimerControlsProps) {
	return (
		<div className="h-full w-full grid grid-cols-[minmax(0,8fr)_minmax(0,59fr)_minmax(0,8fr)]">
			<div className="col-start-1 h-full min-h-0 min-w-0" />
			<div className="col-start-2 min-h-0 min-w-0 flex flex-row justify-between">
				<SecondaryControlSlot>
					<AddMinuteButton onClick={onAddMinute} disabled={!canAddMinute} />
				</SecondaryControlSlot>
				<SecondaryControlSlot>
					<RestartCycleButton onClick={onRestart} />
				</SecondaryControlSlot>
				<div className="col-start-2 min-w-0 min-h-0 flex items-center justify-center">
					<PlayButton isRunning={status === "running"} onStart={onStart} onPause={onPause} />
				</div>
				<SecondaryControlSlot>
					<SkipCycleButton onClick={onSkip} />
				</SecondaryControlSlot>
				<SecondaryControlSlot>
					<PictureInPictureButton />
				</SecondaryControlSlot>
			</div>
			<div className="col-start-3 h-full min-h-0 min-w-0" />
		</div>
	);
}

export default TimerControls;
