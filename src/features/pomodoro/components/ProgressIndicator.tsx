import { useLayoutEffect, useRef } from "react";
import { getProgressPercentage } from "../model/pomodoroTimer";

type ProgressIndicatorProps = {
	totalDurationMs: number;
	remainingMs: number;
	phaseDurationMs?: number;
	cycleAccountedBeforePhaseMs?: number;
	endsAtMs?: number | null;
};

function getFillClipPath(ratio: number) {
	return `inset(0 ${(1 - ratio) * 100}% 0 0 round 9999px)`;
}

function ProgressIndicator({
	totalDurationMs,
	remainingMs,
	phaseDurationMs = 0,
	cycleAccountedBeforePhaseMs = 0,
	endsAtMs = null,
}: ProgressIndicatorProps) {
	const fillRef = useRef<HTMLDivElement>(null);
	const progress = getProgressPercentage(totalDurationMs, remainingMs);
	const elapsedMs = Math.max(0, Math.min(totalDurationMs, totalDurationMs - remainingMs));
	const progressRatio = totalDurationMs > 0 ? elapsedMs / totalDurationMs : 0;
	const isAnimating = endsAtMs !== null && phaseDurationMs > 0 && totalDurationMs > 0;

	useLayoutEffect(() => {
		const fill = fillRef.current;
		if (!fill || endsAtMs === null || phaseDurationMs <= 0 || totalDurationMs <= 0) return;
		const startRatio = Math.max(0, Math.min(1, cycleAccountedBeforePhaseMs / totalDurationMs));
		const endRatio = Math.max(0, Math.min(1, (cycleAccountedBeforePhaseMs + phaseDurationMs) / totalDurationMs));
		const animation = fill.animate([
			{ clipPath: getFillClipPath(startRatio) },
			{ clipPath: getFillClipPath(endRatio) },
		], { duration: phaseDurationMs, easing: "linear", fill: "both" });
		// Document.timeline shares performance.now()'s origin. Resume at the real phase position.
		animation.startTime = endsAtMs - phaseDurationMs;
		return () => animation.cancel();
	}, [endsAtMs, phaseDurationMs, cycleAccountedBeforePhaseMs, totalDurationMs]);

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
				<div
					aria-hidden="true"
					className="h-full w-full overflow-hidden rounded-full bg-[#696D79]"
				>
					<div
						ref={fillRef}
						className="h-full w-full bg-[#C2C4D8]"
						style={{
							clipPath: isAnimating ? undefined : getFillClipPath(progressRatio),
							willChange: isAnimating ? "clip-path" : undefined,
						}}
					/>
				</div>
				<progress
					className="sr-only"
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
