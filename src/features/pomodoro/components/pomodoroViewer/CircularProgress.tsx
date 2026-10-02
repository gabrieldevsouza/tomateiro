import { memo, useLayoutEffect, useRef, useState } from "react";

enum CircularProgressOrientation {Horizontal,Vertical}

interface CircularProgressProps {
    value: number;
    showText?: boolean;
    textSize?: number;
    orientation?: CircularProgressOrientation;
    transitionId?: number;
}

// CSS "ease": cubic-bezier(.25, .1, .25, 1), with time resolved on the x axis.
function getProgressTransitionEase(fraction: number) {
    if (fraction <= 0) return 0;
    if (fraction >= 1) return 1;
    let low = 0;
    let high = 1;
    for (let iteration = 0; iteration < 24; iteration += 1) {
        const position = (low + high) / 2;
        const inverse = 1 - position;
        const time = 3 * inverse * inverse * position * .25 +
            3 * inverse * position * position * .25 + position * position * position;
        if (time < fraction) low = position;
        else high = position;
    }
    const position = (low + high) / 2;
    const inverse = 1 - position;
    return 3 * inverse * inverse * position * .1 +
        3 * inverse * position * position + position * position * position;
}

function CircularProgress({
    value,
    showText = false,
    textSize = 36,
    orientation = CircularProgressOrientation.Horizontal,
    transitionId = 0,
}: CircularProgressProps) {
    const progress = Math.max(0, Math.min(100, value));
    const latestProgressRef = useRef(progress);
    const visualProgressRef = useRef(progress);
    const transitionIdRef = useRef(transitionId);
    const reducedMotionRef = useRef(false);
    const animationRef = useRef<{ from: number; startedAtMs: number } | null>(null);
    const frameRef = useRef<number | null>(null);
    const [visualProgress, setVisualProgress] = useState({ value: progress, isAnimating: false });

    function cancelProgressTransition() {
        if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        animationRef.current = null;
    }

    useLayoutEffect(() => {
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        reducedMotionRef.current = motion.matches;
        function handleMotionChange() {
            reducedMotionRef.current = motion.matches;
            if (!motion.matches) return;
            cancelProgressTransition();
            visualProgressRef.current = latestProgressRef.current;
            setVisualProgress({ value: latestProgressRef.current, isAnimating: false });
        }
        motion.addEventListener("change", handleMotionChange);
        return () => {
            cancelProgressTransition();
            motion.removeEventListener("change", handleMotionChange);
        };
    }, []);

    useLayoutEffect(() => {
        latestProgressRef.current = progress;
        if (transitionIdRef.current === transitionId) {
            if (animationRef.current === null) visualProgressRef.current = progress;
            return;
        }
        transitionIdRef.current = transitionId;
        const from = visualProgressRef.current;
        cancelProgressTransition();
        if (reducedMotionRef.current || from === progress) {
            visualProgressRef.current = progress;
            setVisualProgress({ value: progress, isAnimating: false });
            return;
        }

        const animation = { from, startedAtMs: performance.now() };
        animationRef.current = animation;
        setVisualProgress({ value: from, isAnimating: true });
        function frame(nowMs: number) {
            if (animationRef.current !== animation) return;
            frameRef.current = null;
            const fraction = Math.max(0, Math.min(1, (nowMs - animation.startedAtMs) / 300));
            const target = latestProgressRef.current;
            const next = fraction >= 1
                ? target
                : animation.from + (target - animation.from) * getProgressTransitionEase(fraction);
            visualProgressRef.current = next;
            if (fraction >= 1) {
                animationRef.current = null;
                setVisualProgress({ value: next, isAnimating: false });
                return;
            }
            setVisualProgress({ value: next, isAnimating: true });
            frameRef.current = window.requestAnimationFrame(frame);
        }
        frameRef.current = window.requestAnimationFrame(frame);
    }, [progress, transitionId]);

    const displayedProgress = visualProgress.isAnimating ? visualProgress.value : progress;
    const createSlice = (
        startAngle: number,
        endAngle: number
    ) => {
        const startX =
            50 + 50 * Math.cos((startAngle * Math.PI) / 180);

        const startY =
            50 + 50 * Math.sin((startAngle * Math.PI) / 180);

        const endX =
            50 + 50 * Math.cos((endAngle * Math.PI) / 180);

        const endY =
            50 + 50 * Math.sin((endAngle * Math.PI) / 180);

        const angle = endAngle - startAngle;
        const largeArcFlag = angle > 180 ? 1 : 0;

        return `
            M 50 50
            L ${startX} ${startY}
            A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}
            Z
        `;
    };

    const progressAngle = (displayedProgress / 100) * 360;

    const startAngle = -90;
    const progressEndAngle = startAngle + progressAngle;

    const sizeClassName =
        orientation === CircularProgressOrientation.Vertical
            ? "h-auto w-full"
            : "h-full w-auto";

    return (
        <div
            className={`
                aspect-square
                min-w-0
                min-h-0
                shrink
                ${sizeClassName}
            `}
        >
            <svg
                viewBox="0 0 100 100"
                className="block size-full"
                role="img"
                aria-label={`Progresso: ${progress}%`}
            >
                {/* 0% */}
                {displayedProgress <= 0 && (
                    <circle
                        cx="50"
                        cy="50"
                        r="50"
                        fill="#6b7280"
                    />
                )}

                {/* Entre 0% e 100% */}
                {displayedProgress > 0 && displayedProgress < 100 && (
                    <>
                        {/* Progresso */}
                        <path
                            d={createSlice(
                                startAngle,
                                progressEndAngle
                            )}
                            fill="#fde047"
                        />

                        {/* Restante */}
                        <path
                            d={createSlice(
                                progressEndAngle,
                                startAngle + 360
                            )}
                            fill="#6b7280"
                        />
                    </>
                )}

                {/* 100% */}
                {displayedProgress >= 100 && (
                    <circle
                        cx="50"
                        cy="50"
                        r="50"
                        fill="#fde047"
                    />
                )}

                {/* Texto */}
                {showText && (
                    <text
                        x="50"
                        y="50"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={textSize}
                    >
                        {progress}%
                    </text>
                )}
            </svg>
        </div>
    );
}

// Skip unchanged focus markers while the active marker receives fractional progress.
export default memo(CircularProgress);
