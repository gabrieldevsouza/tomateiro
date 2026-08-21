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
				[container-type:size]
			"
		>
			<div
				className="
					flex
					aspect-[8/9]
					w-[min(100cqw,88.8889cqh)]
					flex-row
					items-center
					justify-center
				"
			>
				<div className="
					flex
					flex-[3_1_0%]
					h-full
					items-center
					justify-center
				" />

				<div className="
					flex
					flex-col
					flex-[10_1_0%]
					h-full
					items-center
					justify-center
				">
					<div className="
						flex
						flex-[1_1_0%]
						w-full
						items-center
						justify-center
					" />

					<div className="
						flex
						flex-[4_1_0%]
						w-full
						items-center
						justify-center
					">
						<PomodoroPanel />
					</div>

					<div className="
						flex
						flex-[1_1_0%]
						w-full
						items-center
						justify-center
					" />
				</div>

				<div className="
					flex
					flex-[3_1_0%]
					h-full
					items-center
					justify-center
				" />
			</div>
		</section>
	);
}

export default PomodoroView;
