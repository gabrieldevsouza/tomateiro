type TimerDisplayProps = {
	remainingMs: number;
};

function TimerDisplay({ remainingMs }: TimerDisplayProps) {
	const totalSeconds = Math.ceil(remainingMs / 1_000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

	return (
		<div className="

			h-full
			w-full

			grid

			grid-cols-[minmax(0,43fr)_minmax(0,92fr)_minmax(0,43fr)]
		" >

			<div className="

				col-start-1
				min-h-0
				min-w-0
			"/>

			<div className="

				col-start-2
				min-h-0
				min-w-0
			"
			style={{containerType: "size"}}
			>

				<time
					dateTime={`PT${totalSeconds}S`}
					className="
						flex
						h-full
						w-full
						items-center
						justify-center
						font-[Epilogue]
						text-[#00CBEA]
						leading-none
						tabular-nums
					"
					style={{
						fontSize: "min(46cqw,71cqh)",
						transform: "translateY(0.09em)",
					}}
					aria-label={`${minutes} minutos e ${seconds} segundos restantes`}
				>
					{formattedTime}
				</time>
			</div>

			<div className="

				col-start-3
				min-h-0
				min-w-0
			"/>

		</div>
	);
}

export default TimerDisplay;
