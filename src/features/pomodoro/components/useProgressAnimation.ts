import { useLayoutEffect, useRef, type RefObject } from "react";

export const PROGRESS_RATIO_PROPERTY = "--pomodoro-progress-ratio";
const PROGRESS_TRANSITION_MS = 300;

type ProgressAnimationOptions = {
	property?: `--${string}`;
	ratio: number;
	phaseStartRatio?: number;
	phaseEndRatio?: number;
	phaseDurationMs?: number;
	endsAtMs?: number | null;
	transitionId?: number;
};

export function useProgressAnimation(
	elementRef: RefObject<HTMLElement | null>,
	{
		property = PROGRESS_RATIO_PROPERTY,
		ratio,
		phaseStartRatio = 0,
		phaseEndRatio = 1,
		phaseDurationMs = 0,
		endsAtMs = null,
		transitionId = 0,
	}: ProgressAnimationOptions,
): void {
	const previousVisualRef = useRef<{
		ratio: number;
		transitionId: number;
		transitionEndsAtMs: number | null;
	} | null>(null);
	const isAnimating = endsAtMs !== null && phaseDurationMs > 0;
	const staticRatio = isAnimating ? null : ratio;

	useLayoutEffect(() => {
		const element = elementRef.current;
		if (!element) return;
		const nowMs = performance.now();
		const previous = previousVisualRef.current;
		const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
		// Only discrete actions ease; ticks leave the deadline animation running.
		let transitionEndsAtMs = motionPreference.matches || !previous ? null
			: previous.transitionId !== transitionId ? nowMs + PROGRESS_TRANSITION_MS
			: previous.transitionEndsAtMs;
		const transitionMs = Math.max(0, (transitionEndsAtMs ?? nowMs) - nowMs);
		const targetRatio = staticRatio ?? ratio;
		element.style.setProperty(property, String(targetRatio));
		let animation: Animation | undefined;
		function animatePhase(deadlineMs: number) {
			const phaseAnimation = element!.animate([
				{ [property]: String(phaseStartRatio) },
				{ [property]: String(phaseEndRatio) },
			], { duration: phaseDurationMs, easing: "linear", fill: "both" });
			// The default document timeline shares performance.now()'s origin.
			phaseAnimation.startTime = deadlineMs - phaseDurationMs;
			return phaseAnimation;
		}

		if (isAnimating && endsAtMs !== null) {
			const remainingPhaseMs = Math.max(0, endsAtMs - nowMs);
			const catchUpMs = Math.min(transitionMs, remainingPhaseMs);
			if (previous && catchUpMs > 0) {
				// Catch up to the real clock, then continue linearly to the same phase deadline.
				const catchUpRatio = Math.max(phaseStartRatio, Math.min(phaseEndRatio,
					phaseStartRatio + (phaseEndRatio - phaseStartRatio)
						* (phaseDurationMs - remainingPhaseMs + catchUpMs) / phaseDurationMs));
				const keyframes: Keyframe[] = [
					{ [property]: String(previous.ratio), offset: 0, easing: "ease" },
					{ [property]: String(catchUpRatio), offset: catchUpMs / remainingPhaseMs, easing: "linear" },
				];
				if (catchUpMs < remainingPhaseMs) keyframes.push({ [property]: String(phaseEndRatio), offset: 1 });
				animation = element.animate(keyframes, { duration: remainingPhaseMs, easing: "linear", fill: "both" });
				animation.startTime = nowMs;
			} else {
				animation = animatePhase(endsAtMs);
			}
		} else if (previous && transitionMs > 0 && previous.ratio !== targetRatio) {
			animation = element.animate([
				{ [property]: String(previous.ratio) },
				{ [property]: String(targetRatio) },
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
				? Number.parseFloat(getComputedStyle(element).getPropertyValue(property))
				: targetRatio;
			previousVisualRef.current = {
				ratio: Number.isFinite(paintedRatio) ? Math.max(0, Math.min(1, paintedRatio)) : targetRatio,
				transitionId,
				transitionEndsAtMs,
			};
			animation?.cancel();
			motionPreference.removeEventListener("change", handleMotionPreferenceChange);
		};
	}, [elementRef, property, endsAtMs, phaseDurationMs, phaseStartRatio, phaseEndRatio, transitionId, staticRatio, isAnimating]);
}
