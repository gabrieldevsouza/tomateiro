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
        <div
            className="
                grid
                h-full
                w-full
                min-h-0
                min-w-0
                grid-cols-[minmax(0,4fr)_minmax(0,7fr)_minmax(0,4fr)]
                bg-green-500
            "
        >
            <div
                className="
                    col-start-1
                    h-full
                    min-h-0
                    min-w-0
                    bg-fuchsia-500
                "
            />

            <div
                className="
                    col-start-2
                    grid
                    h-full
                    min-h-0
                    min-w-0
                    grid-cols-5
                    bg-blue-400
                "
            >
                <AddMinuteButton onClick={onAddMinute} />

                <RestartCycleButton onClick={onRestart} />

                <PlayButton
                    isRunning={isRunning}
                    onStart={onStart}
                    onPause={onPause}
                />

                <SkipCycleButton onClick={onSkip} />

                <PictureInPictureButton />
            </div>

            <div
                className="
                    col-start-3
                    h-full
                    min-h-0
                    min-w-0
                    bg-emerald-400
                "
            />
        </div>
    );
}

export default TimerControls;