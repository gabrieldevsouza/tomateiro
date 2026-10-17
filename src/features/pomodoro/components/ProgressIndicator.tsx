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
	const progressContainerRef = useRef<HTMLDivElement>(null);
	const progress = getProgressPercentage(totalDurationMs, remainingMs);
	const elapsedMs = Math.max(0, Math.min(totalDurationMs, totalDurationMs - remainingMs));
	const progressRatio = totalDurationMs > 0 ? elapsedMs / totalDurationMs : 0;
	const isAnimating = endsAtMs !== null && phaseDurationMs > 0 && totalDurationMs > 0;
	useProgressAnimation(progressContainerRef, {
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

			<div ref={progressContainerRef} className="


				col-start-1
				min-h-0
				min-w-0
				relative
				flex
				justify-center
				items-center
			"
				// One animated ratio drives the native fill and the matching text clip.
				style={{
					containerType: "size",
					[PROGRESS_RATIO_PROPERTY]: isAnimating ? undefined : progressRatio,
					"--pomodoro-progress-static-ratio": progressRatio,
				} as CSSProperties}
			>
				{/* Blink's internal fill stays full width; clip its animated fraction only once.
				    Gecko keeps native value/max sizing. Both retain DaisyUI's progress element. */}
				<progress
					className="
						progress
						pomodoro-progress
						w-full
						h-full
						rounded-full
						bg-[#2B416B]
						text-[#C2C4D8]
						[&::-webkit-progress-bar]:bg-[#2B416B]
						[&::-webkit-progress-value]:rounded-full
						[&::-webkit-progress-value]:inline-full!
						[&::-webkit-progress-value]:[clip-path:inset(0_calc((1-var(--pomodoro-progress-ratio))*100%)_0_0_round_9999px)]
						[&::-webkit-progress-value]:transition-none
						[&::-moz-progress-bar]:rounded-full
						[&::-moz-progress-bar]:transition-none
					"
					value={elapsedMs}
					max={Math.max(1, totalDurationMs)}
					aria-label="Progresso do ciclo completo"
					aria-valuetext={`${progress}%`}
				/>
				<span
					aria-hidden="true"
					className="
						absolute
						inset-0
						font-[Epilogue]
						font-semibold
						pointer-events-none
						text-[#A5B1CE]
						supports-[-moz-appearance:none]:[--pomodoro-progress-ratio:var(--pomodoro-progress-static-ratio)]
					"
					style={{
						fontSize: "min(40cqw,60cqh)",
					}}
				>
					<span className="absolute inset-0 flex items-center justify-center translate-y-[0.1em]">{progress}%</span>
					{/* Match the fill's rounded clip, including the edge crossing a digit.
					    Gecko's native fill uses value/max, so its text uses the same static ratio. */}
					<span className="absolute inset-0 text-[#212940] [clip-path:inset(0_calc((1-var(--pomodoro-progress-ratio))*100%)_0_0_round_9999px)]">
						<span className="absolute inset-0 flex items-center justify-center translate-y-[0.1em]">{progress}%</span>
					</span>
				</span>
			</div>
				
		</div>
	);
}

export default ProgressIndicator;
