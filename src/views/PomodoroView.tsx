import PomodoroPanel from "../features/pomodoro/PomodoroPanel";

function PomodoroView() {
	return (
		<section
			className="
				flex
				h-full
				w-full
				items-center
				border-4
				justify-center
				@container-size
			"
		>
			<div
				className="
					grid
					aspect-8/9
					w-[min(100cqw,88.8889cqh)]
					grid-cols-[minmax(0,3fr)_minmax(0,10fr)_minmax(0,3fr)]
					grid-rows-[minmax(0,1fr)_minmax(0,4fr)_minmax(0,1fr)]
				"
			>
				<div className="
					row-start-2
					col-start-2
					min-h-0
					min-w-0
				">
					<PomodoroPanel />
				</div>
			</div>
		</section>
	);
}

export default PomodoroView;
