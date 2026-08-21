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
			<div
				className="
					grid
					aspect-8/9
					w-[min(100cqw,88.8889cqh)]
					grid-cols-[3fr_10fr_3fr]
					grid-rows-[1fr_4fr_1fr]
				"
			>
				<div className="
					row-start-2
					col-start-2
					flex
					items-center
					justify-center
				">
					<PomodoroPanel />
				</div>
			</div>
		</section>
	);
}

export default PomodoroView;
