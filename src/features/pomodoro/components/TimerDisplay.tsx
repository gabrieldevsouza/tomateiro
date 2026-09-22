type TimerDisplayProps = {
	remainingMs: number;
};

function TimerDisplay({ remainingMs }: TimerDisplayProps) {
	const totalSeconds = Math.ceil(remainingMs / 1_000);
	const hours = Math.floor(totalSeconds / 3_600);
	const minutes = Math.floor(totalSeconds / 60) % 60;
	const seconds = totalSeconds % 60;
	const formattedTime = [...(hours > 0 ? [hours] : []), minutes, seconds]
		.map((part) => String(part).padStart(2, "0")).join(":");

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
						select-none
					"
					style={{
						fontSize: `min(${46 * 5 / formattedTime.length}cqw,71cqh)`,
						transform: "translateY(0.09em)",
					}}
					aria-label={`${hours > 0 ? `${hours} horas, ` : ""}${minutes} minutos e ${seconds} segundos restantes`}
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
