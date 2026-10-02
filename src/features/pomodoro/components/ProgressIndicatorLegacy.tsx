import { useLayoutEffect, useRef } from "react";
import { getProgressPercentage } from "../model/pomodoroTimer";

type ProgressIndicatorProps = {
	totalDurationMs: number;
	remainingMs: number;
	phaseDurationMs?: number;
	cycleAccountedBeforePhaseMs?: number;
	endsAtMs?: number | null;
	transitionId?: number;
};

const PROGRESS_TRANSITION_MS = 300;

function getFillClipPath(ratio: number) {
	return `inset(0 ${(1 - ratio) * 100}% 0 0 round 9999px)`;
}

function ProgressIndicator({
	totalDurationMs,
	remainingMs,
	phaseDurationMs = 0,
	cycleAccountedBeforePhaseMs = 0,
	endsAtMs = null,
	transitionId = 0,
}: ProgressIndicatorProps) {
	const fillRef = useRef<HTMLDivElement>(null);
	const previousVisualRef = useRef<{
		clipPath: string;
		transitionId: number;
		transitionEndsAtMs: number | null;
	} | null>(null);
	const progress = getProgressPercentage(totalDurationMs, remainingMs);
	const elapsedMs = Math.max(0, Math.min(totalDurationMs, totalDurationMs - remainingMs));
	const progressRatio = totalDurationMs > 0 ? elapsedMs / totalDurationMs : 0;
	const isAnimating = endsAtMs !== null && phaseDurationMs > 0 && totalDurationMs > 0;
	const staticRatio = isAnimating ? null : progressRatio;

	useLayoutEffect(() => {
		const fill = fillRef.current;
		if (!fill) return;
		const nowMs = performance.now();
		const previous = previousVisualRef.current;
		const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
		// A new action retargets from the painted value. Play/pause preserve a catch-up in flight.
		let transitionEndsAtMs = motionPreference.matches || !previous ? null
			: previous.transitionId !== transitionId ? nowMs + PROGRESS_TRANSITION_MS
			: previous.transitionEndsAtMs;
		const transitionMs = Math.max(0, (transitionEndsAtMs ?? nowMs) - nowMs);
		const targetClipPath = getFillClipPath(staticRatio ?? progressRatio);
		fill.style.clipPath = targetClipPath;
		let animation: Animation | undefined;
		function animatePhase() {
			const startRatio = Math.max(0, Math.min(1, cycleAccountedBeforePhaseMs / totalDurationMs));
			const endRatio = Math.max(0, Math.min(1, (cycleAccountedBeforePhaseMs + phaseDurationMs) / totalDurationMs));
			const phaseAnimation = fill!.animate([
				{ clipPath: getFillClipPath(startRatio) },
				{ clipPath: getFillClipPath(endRatio) },
			], { duration: phaseDurationMs, easing: "linear", fill: "both" });
			// Document.timeline shares performance.now()'s origin.
			phaseAnimation.startTime = endsAtMs! - phaseDurationMs;
			return phaseAnimation;
		}

		if (isAnimating && endsAtMs !== null) {
			const startRatio = Math.max(0, Math.min(1, cycleAccountedBeforePhaseMs / totalDurationMs));
			const endRatio = Math.max(0, Math.min(1, (cycleAccountedBeforePhaseMs + phaseDurationMs) / totalDurationMs));
			const remainingPhaseMs = Math.max(0, endsAtMs - nowMs);
			const catchUpMs = Math.min(transitionMs, remainingPhaseMs);
			if (previous && catchUpMs > 0) {
				// Meet the real timer at the end of the ease, then follow its deadline linearly.
				const catchUpRatio = Math.max(startRatio, Math.min(endRatio,
					(cycleAccountedBeforePhaseMs + phaseDurationMs - remainingPhaseMs + catchUpMs) / totalDurationMs));
				const keyframes: Keyframe[] = [
					{ clipPath: previous.clipPath, offset: 0, easing: "ease" },
					{ clipPath: getFillClipPath(catchUpRatio), offset: catchUpMs / remainingPhaseMs, easing: "linear" },
				];
				if (catchUpMs < remainingPhaseMs) keyframes.push({ clipPath: getFillClipPath(endRatio), offset: 1 });
				animation = fill.animate(keyframes, { duration: remainingPhaseMs, easing: "linear", fill: "both" });
				animation.startTime = nowMs;
			} else {
				animation = animatePhase();
			}
		} else if (previous && transitionMs > 0 && previous.clipPath !== targetClipPath) {
			animation = fill.animate([
				{ clipPath: previous.clipPath },
				{ clipPath: targetClipPath },
			], { duration: transitionMs, easing: "ease", fill: "both" });
			animation.startTime = nowMs;
		}
		function handleMotionPreferenceChange() {
			if (!motionPreference.matches || transitionEndsAtMs === null) return;
			transitionEndsAtMs = null;
			animation?.cancel();
			animation = isAnimating ? animatePhase() : undefined;
		}
		motionPreference.addEventListener("change", handleMotionPreferenceChange);

		return () => {
			// Read before cancelling: repeated Skip must start where the previous animation is painted.
			previousVisualRef.current = {
				clipPath: animation ? getComputedStyle(fill).clipPath : targetClipPath,
				transitionId,
				transitionEndsAtMs,
			};
			animation?.cancel();
			motionPreference.removeEventListener("change", handleMotionPreferenceChange);
		};
	}, [endsAtMs, phaseDurationMs, cycleAccountedBeforePhaseMs, totalDurationMs, transitionId, staticRatio, isAnimating]);

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
