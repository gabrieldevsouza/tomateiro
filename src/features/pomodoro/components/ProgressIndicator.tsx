import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { getProgressPercentage } from "../model/pomodoroTimer";

type ProgressIndicatorProps = {
	totalDurationMs: number;
	remainingMs: number;
	phaseDurationMs?: number;
	cycleAccountedBeforePhaseMs?: number;
	endsAtMs?: number | null;
	transitionId?: number;
};

const PROGRESS_RATIO_PROPERTY = "--pomodoro-progress-ratio";
const PROGRESS_TRANSITION_MS = 300;

function ProgressIndicator({
	totalDurationMs,
	remainingMs,
	phaseDurationMs = 0,
	cycleAccountedBeforePhaseMs = 0,
	endsAtMs = null,
	transitionId = 0,
}: ProgressIndicatorProps) {
	const progressRef = useRef<HTMLProgressElement>(null);
	const previousVisualRef = useRef<{
		ratio: number;
		transitionId: number;
		transitionEndsAtMs: number | null;
	} | null>(null);
	const progress = getProgressPercentage(totalDurationMs, remainingMs);
	const elapsedMs = Math.max(0, Math.min(totalDurationMs, totalDurationMs - remainingMs));
	const progressRatio = totalDurationMs > 0 ? elapsedMs / totalDurationMs : 0;
	const isAnimating = endsAtMs !== null && phaseDurationMs > 0 && totalDurationMs > 0;
	const staticRatio = isAnimating ? null : progressRatio;

	useLayoutEffect(() => {
		const element = progressRef.current;
		if (!element) return;
		const nowMs = performance.now();
		const previous = previousVisualRef.current;
		const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
		// Only discrete actions ease; ticks leave the deadline animation running.
		let transitionEndsAtMs = motionPreference.matches || !previous ? null
			: previous.transitionId !== transitionId ? nowMs + PROGRESS_TRANSITION_MS
			: previous.transitionEndsAtMs;
		const transitionMs = Math.max(0, (transitionEndsAtMs ?? nowMs) - nowMs);
		const targetRatio = staticRatio ?? progressRatio;
		element.style.setProperty(PROGRESS_RATIO_PROPERTY, String(targetRatio));
		let animation: Animation | undefined;
		function animatePhase(deadlineMs: number) {
			const startRatio = Math.max(0, Math.min(1, cycleAccountedBeforePhaseMs / totalDurationMs));
			const endRatio = Math.max(0, Math.min(1, (cycleAccountedBeforePhaseMs + phaseDurationMs) / totalDurationMs));
			const phaseAnimation = element!.animate([
				{ [PROGRESS_RATIO_PROPERTY]: String(startRatio) },
				{ [PROGRESS_RATIO_PROPERTY]: String(endRatio) },
			], { duration: phaseDurationMs, easing: "linear", fill: "both" });
			// The default document timeline shares performance.now()'s origin.
			phaseAnimation.startTime = deadlineMs - phaseDurationMs;
			return phaseAnimation;
		}

		if (isAnimating && endsAtMs !== null) {
			const startRatio = Math.max(0, Math.min(1, cycleAccountedBeforePhaseMs / totalDurationMs));
			const endRatio = Math.max(0, Math.min(1, (cycleAccountedBeforePhaseMs + phaseDurationMs) / totalDurationMs));
			const remainingPhaseMs = Math.max(0, endsAtMs - nowMs);
			const catchUpMs = Math.min(transitionMs, remainingPhaseMs);
			if (previous && catchUpMs > 0) {
				// Catch up to the real clock, then continue linearly to the same phase deadline.
				const catchUpRatio = Math.max(startRatio, Math.min(endRatio,
					(cycleAccountedBeforePhaseMs + phaseDurationMs - remainingPhaseMs + catchUpMs) / totalDurationMs));
				const keyframes: Keyframe[] = [
					{ [PROGRESS_RATIO_PROPERTY]: String(previous.ratio), offset: 0, easing: "ease" },
					{ [PROGRESS_RATIO_PROPERTY]: String(catchUpRatio), offset: catchUpMs / remainingPhaseMs, easing: "linear" },
				];
				if (catchUpMs < remainingPhaseMs) keyframes.push({ [PROGRESS_RATIO_PROPERTY]: String(endRatio), offset: 1 });
				animation = element.animate(keyframes, { duration: remainingPhaseMs, easing: "linear", fill: "both" });
				animation.startTime = nowMs;
			} else {
				animation = animatePhase(endsAtMs);
			}
		} else if (previous && transitionMs > 0 && previous.ratio !== targetRatio) {
			animation = element.animate([
				{ [PROGRESS_RATIO_PROPERTY]: String(previous.ratio) },
				{ [PROGRESS_RATIO_PROPERTY]: String(targetRatio) },
			], { duration: transitionMs, easing: "ease", fill: "both" });
			animation.startTime = nowMs;
		}
		function handleMotionPreferenceChange() {
			if (!motionPreference.matches || transitionEndsAtMs === null) return;
			transitionEndsAtMs = null;
			animation?.cancel();
			animation = isAnimating && endsAtMs !== null ? animatePhase(endsAtMs) : undefined;
		}
		motionPreference.addEventListener("change", handleMotionPreferenceChange);

		return () => {
			const paintedRatio = animation
				? Number.parseFloat(getComputedStyle(element).getPropertyValue(PROGRESS_RATIO_PROPERTY))
				: targetRatio;
			previousVisualRef.current = {
				ratio: Number.isFinite(paintedRatio) ? Math.max(0, Math.min(1, paintedRatio)) : targetRatio,
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
