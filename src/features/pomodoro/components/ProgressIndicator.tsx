import { useRef, type CSSProperties } from "react";
import { getProgressPercentage } from "../model/pomodoroTimer";
import { PROGRESS_RATIO_PROPERTY, useProgressAnimation } from "./useProgressAnimation";

type ProgressIndicatorProps = {
	totalDurationMs: number;
	remainingMs: number;
	phaseDurationMs?: number;
	cycleAccountedBeforePhaseMs?: number;
	endsAtMs?: number | null;
	transitionId?: number;
};

function ProgressIndicator({
	totalDurationMs,
	remainingMs,
	phaseDurationMs = 0,
	cycleAccountedBeforePhaseMs = 0,
	endsAtMs = null,
	transitionId = 0,
}: ProgressIndicatorProps) {
	const progressRef = useRef<HTMLProgressElement>(null);
	const progress = getProgressPercentage(totalDurationMs, remainingMs);
	const elapsedMs = Math.max(0, Math.min(totalDurationMs, totalDurationMs - remainingMs));
	const progressRatio = totalDurationMs > 0 ? elapsedMs / totalDurationMs : 0;
	const isAnimating = endsAtMs !== null && phaseDurationMs > 0 && totalDurationMs > 0;
	useProgressAnimation(progressRef, {
		ratio: progressRatio,
		phaseStartRatio: totalDurationMs > 0 ? Math.max(0, Math.min(1, cycleAccountedBeforePhaseMs / totalDurationMs)) : 0,
		phaseEndRatio: totalDurationMs > 0 ? Math.max(0, Math.min(1, (cycleAccountedBeforePhaseMs + phaseDurationMs) / totalDurationMs)) : 0,
		phaseDurationMs,
		endsAtMs: isAnimating ? endsAtMs : null,
		transitionId,
	});

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
				{/* Blink's internal fill stays full width; clip its animated fraction only once.
				    Gecko keeps native value/max sizing. Both retain DaisyUI's progress element. */}
				<progress
					ref={progressRef}
					className="
						progress
						pomodoro-progress
						w-full
						h-full
						rounded-full
						bg-[#696D79]
						text-[#C2C4D8]
						[&::-webkit-progress-bar]:bg-[#696D79]
						[&::-webkit-progress-value]:rounded-full
						[&::-webkit-progress-value]:[inline-size:100%]!
						[&::-webkit-progress-value]:[clip-path:inset(0_calc((1_-_var(--pomodoro-progress-ratio))*100%)_0_0_round_9999px)]
						[&::-webkit-progress-value]:transition-none
						[&::-moz-progress-bar]:rounded-full
						[&::-moz-progress-bar]:transition-none
					"
					style={{ [PROGRESS_RATIO_PROPERTY]: isAnimating ? undefined : progressRatio } as CSSProperties}
					value={elapsedMs}
					max={Math.max(1, totalDurationMs)}
					aria-label="Progresso do ciclo completo"
					aria-valuetext={`${progress}%`}
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
