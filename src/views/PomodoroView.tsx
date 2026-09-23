import PomodoroPanel from "../features/pomodoro/PomodoroPanel";

function PomodoroView() {
	return (
		<section
			className="
				flex
				h-full
				w-full
				items-center
				justify-center
				@container-size
			"
		>
			<PomodoroPanel />
		</section>
	);
}

export default PomodoroView;
