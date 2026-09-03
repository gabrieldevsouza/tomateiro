function TimerDisplay() {
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
					dateTime="PT25M"
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
					aria-label="25 minutos restantes"
				>
					25:00
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
