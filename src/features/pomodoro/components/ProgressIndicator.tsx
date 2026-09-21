import { getProgressPercentage } from "../model/pomodoroTimer";

type ProgressIndicatorProps = {
	totalDurationMs: number;
	remainingMs: number;
};

function ProgressIndicator({ totalDurationMs, remainingMs }: ProgressIndicatorProps) {
	const progress = getProgressPercentage(totalDurationMs, remainingMs);

	return (
		<div className="

			h-full
			w-full

			grid

			grid-cols-[minmax(0,1fr)]
		" >

			<div className="


				col-start-1
				min-h-0
				min-w-0
				relative
				flex
				justify-center
				items-center
			"
				style={{containerType: "size"}}
			>
				<progress
  					className="
						progress
						w-full 
						h-full
						rounded-full
						[&::-webkit-progress-bar]:bg-[#696D79]
						[&::-moz-progress-bar]:bg-[#696D79]
						[&::-webkit-progress-value]:bg-[#C2C4D8]
						[&::-moz-progress-value]:bg-[#C2C4D8]
						[&::-webkit-progress-value]:rounded-full
						[&::-moz-progress-bar]:rounded-full
					"
					value={progress}
  					max={100}
					aria-label="Progresso do ciclo completo"
				/>
				<span
					className="
						absolute
						inset-0
						flex
						items-center
						justify-center
						font-[Epilogue]
						font-semibold
						pointer-events-none
						text-[#212940]
					"
					style={{
						fontSize: "min(40cqw,60cqh)",
						transform: "translateY(0.1em)",
					}}
						>
							{progress}%
						</span>
			</div>
				
		</div>
	);
}

export default ProgressIndicator;
