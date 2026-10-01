import PomodoroPanel from "../features/pomodoro/PomodoroPanel";
import EditTimerButton from "../features/pomodoro/components/controls/EditTimerButton";
import { useState } from "react";

function PomodoroView() {
	const [isEditing, setIsEditing] = useState(false);

	return (
		<section
			className="
				relative
				flex
				h-full
				w-full
				items-center
				justify-center
				@container-size
			"
		>
			<PomodoroPanel isEditing={isEditing} onCloseEditor={() => setIsEditing(false)} />
			<div className="absolute bottom-[min(1.5cqw,2.5cqh)] right-[min(1.5cqw,2.5cqh)] aspect-square h-[5.93cqh]">
				<EditTimerButton onClick={() => setIsEditing(true)} />
			</div>
		</section>
	);
}

export default PomodoroView;
