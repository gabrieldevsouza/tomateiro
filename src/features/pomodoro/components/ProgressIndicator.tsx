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
	variant?: "cycle" | "connector" | "connector-return";
	ariaLabel?: string;
};

function ProgressIndicator({
	totalDurationMs,
	remainingMs,
	phaseDurationMs = 0,
	cycleAccountedBeforePhaseMs = 0,
	endsAtMs = null,
	transitionId = 0,
	variant = "cycle",
	ariaLabel = "Progresso do ciclo completo",
}: ProgressIndicatorProps) {
	const progressRef = useRef<HTMLProgressElement>(null);
	const connectorRef = useRef<HTMLProgressElement>(null);
	const returnRef = useRef<HTMLDivElement>(null);
	const progress = getProgressPercentage(totalDurationMs, remainingMs);
	const elapsedMs = Math.max(0, Math.min(totalDurationMs, totalDurationMs - remainingMs));
	const progressRatio = totalDurationMs > 0 ? elapsedMs / totalDurationMs : 0;
	const isAnimating = endsAtMs !== null && phaseDurationMs > 0 && totalDurationMs > 0;
	const animationRef = variant === "connector-return" ? returnRef : variant === "connector" ? connectorRef : progressRef;
	useProgressAnimation(animationRef, {
		ratio: progressRatio,
		phaseStartRatio: totalDurationMs > 0 ? Math.max(0, Math.min(1, cycleAccountedBeforePhaseMs / totalDurationMs)) : 0,
		phaseEndRatio: totalDurationMs > 0 ? Math.max(0, Math.min(1, (cycleAccountedBeforePhaseMs + phaseDurationMs) / totalDurationMs)) : 0,
		phaseDurationMs,
		endsAtMs: isAnimating ? endsAtMs : null,
		transitionId,
	});

	if (variant === "connector-return") {
		return (
			<div
				ref={returnRef}
				className="pomodoro-cycle-return"
				style={{ [PROGRESS_RATIO_PROPERTY]: isAnimating ? undefined : progressRatio } as CSSProperties}
			>
				<progress
					className="sr-only"
					value={elapsedMs}
					max={Math.max(1, totalDurationMs)}
					aria-label={ariaLabel}
					aria-valuetext={`${progress}%`}
				/>
				<span className="pomodoro-cycle-return-start" aria-hidden="true"><span /></span>
				<span className="pomodoro-cycle-return-middle" aria-hidden="true"><span /></span>
				<span className="pomodoro-cycle-return-end" aria-hidden="true"><span /></span>
			</div>
		);
	}

	if (variant === "connector") {
		return (
			<progress
				ref={connectorRef}
				className="progress pomodoro-progress pomodoro-cycle-connector"
				style={{ [PROGRESS_RATIO_PROPERTY]: isAnimating ? undefined : progressRatio } as CSSProperties}
				value={elapsedMs}
				max={Math.max(1, totalDurationMs)}
				aria-label={ariaLabel}
				aria-valuetext={`${progress}%`}
			/>
		);
	}

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
						[&::-moz-progress-bar]:rounded-full
					"
					style={{ [PROGRESS_RATIO_PROPERTY]: isAnimating ? undefined : progressRatio } as CSSProperties}
					value={elapsedMs}
					max={Math.max(1, totalDurationMs)}
					aria-label={ariaLabel}
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
