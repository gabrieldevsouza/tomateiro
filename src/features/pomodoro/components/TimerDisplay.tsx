function TimerDisplay() {
	return (
		<div className="
			bg-green-500

			h-full
			w-full

			grid

			grid-cols-[minmax(0,43fr)_minmax(0,92fr)_minmax(0,43fr)]
		" >

			<div className="
				bg-fuchsia-500

				col-start-1
				min-h-0
				min-w-0
			"/>

			<div className="
				bg-blue-400

				col-start-2
				min-h-0
				min-w-0
			">
				<time
					dateTime="PT25M"
					className="
						flex
						h-full
						w-full
						items-center
						justify-center
						text-4xl
						font-[assistant]
						leading-none
						tabular-nums
					"
					aria-label="25 minutos restantes"
				>
					25:00
				</time>
			</div>

			<div className="
				bg-emerald-400

				col-start-3
				min-h-0
				min-w-0
			"/>

		</div>
	);
}

export default TimerDisplay;
