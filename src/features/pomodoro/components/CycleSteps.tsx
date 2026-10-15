import { memo, useRef, type CSSProperties } from "react";
import { POMODORO_SETTINGS_LIMITS, type PomodoroPhase } from "../model/pomodoroTimer";
import { PROGRESS_RATIO_PROPERTY, useProgressAnimation } from "./useProgressAnimation";

// Colunas: lateral / Steps / lateral. 5 / 30 / 5 reserva 12,5% em cada ponta.
const STEPS_HORIZONTAL_GRID = "minmax(0, 5fr) minmax(0, 30fr) minmax(0, 5fr)";

// true: centraliza círculos + linha de entrada; false: centraliza somente os círculos.
const CENTER_LOWER_ROW_WITH_CONNECTOR = true;
const PAUSE_RATIO_PROPERTY = "--pomodoro-pause-ratio";

type CycleStepsProps = {
    focusProgress: number[];
    currentFocusIndex: number;
    isCurrentFocusComplete: boolean;
    phase: PomodoroPhase;
    phaseDurationMs: number;
    phaseRemainingMs: number;
    endsAtMs: number | null;
    transitionId: number;
};

type CycleStepProps = {
    index: number;
    focusCount: number;
    progress: number;
    isCurrent: boolean;
    isReached: boolean;
    isLowerRow: boolean;
    isRowStart: boolean;
    phaseDurationMs: number;
    endsAtMs: number | null;
    pauseRatio: number;
    pauseDurationMs: number;
    pauseEndsAtMs: number | null;
    transitionId: number;
};

const CycleStep = memo(function CycleStep({
    index, focusCount, progress, isCurrent, isReached, isLowerRow, isRowStart,
    phaseDurationMs, endsAtMs, pauseRatio, pauseDurationMs, pauseEndsAtMs, transitionId,
}: CycleStepProps) {
    const stepRef = useRef<HTMLLIElement>(null);
    const ratio = Math.max(0, Math.min(1, progress / 100));
    useProgressAnimation(stepRef, { ratio, phaseDurationMs, endsAtMs, transitionId });
    useProgressAnimation(stepRef, {
        property: PAUSE_RATIO_PROPERTY,
        ratio: pauseRatio,
        phaseDurationMs: pauseDurationMs,
        endsAtMs: pauseEndsAtMs,
        transitionId,
    });
    const state = isCurrent ? "atual" : isReached ? "percorrido" : "próximo";
    // Keep accessibility updates at whole percentages, independently of visual frames.
    const percentage = ratio === 1 ? 100 : Math.min(99, Math.floor(ratio * 100));
    const pausePercentage = pauseRatio === 1 ? 100 : Math.min(99, Math.floor(pauseRatio * 100));
    const pauseLabel = index > 0 ? ` Pausa entre os focos ${index} e ${index + 1}: ${pausePercentage}%.` : "";

    return (
        <li
            ref={stepRef}
            // Keep DaisyUI's native counter content and circle geometry. The arbitrary pseudo
            // variants only change paint; before:/after: would inject their own content.
            // Connectors overlap the circles to avoid a seam, and blend across one screen
            // CSS pixel regardless of scale. The lower entry keeps a 2rem visible length
            // and its original 4rem mask reference (solid widths 4:6.5:11 = 8:13:22).
            // Anchor the gradient's left edge in the neutral color. At zero, coincident
            // stops prevent fractional resizing from sampling yellow before the line.
            // Transparent circle paint prevents the step-primary base leaking at its edge.
            className={`
                step flex-[0_0_4rem]
                data-lower-row:relative data-lower-row:inset-s-4
                [&::before]:[--pomodoro-pause-overlap:0.0625rem]
                [&::before]:[--pomodoro-pause-start:calc(1rem-var(--pomodoro-pause-overlap))]
                [&::before]:[--pomodoro-pause-span:calc(2rem+2*var(--pomodoro-pause-overlap))]
                [&::before]:[--pomodoro-pause-edge:calc(var(--pomodoro-pause-start)+var(--pomodoro-pause-ratio)*var(--pomodoro-pause-span))]
                [&::before]:[--pomodoro-pause-half-edge:min(calc(0.5px/var(--pomodoro-steps-scale)),calc(var(--pomodoro-pause-ratio)*var(--pomodoro-pause-span)),calc((1-var(--pomodoro-pause-ratio))*var(--pomodoro-pause-span)))]
                [&::before]:bg-base-300 [&::before]:bg-origin-border [&::before]:border-transparent
                [&::before]:bg-[linear-gradient(to_right,var(--color-base-300)_0px,var(--color-primary)_0px_calc(var(--pomodoro-pause-edge)-var(--pomodoro-pause-half-edge)),var(--color-base-300)_calc(var(--pomodoro-pause-edge)+var(--pomodoro-pause-half-edge)))]
                [&[data-row-start]::before]:w-[calc(100%-1rem)]
                [&[data-row-start]::before]:ms-[calc(-100%+1rem)]
                [&[data-row-start]::before]:[--pomodoro-pause-start:0rem]
                [&[data-row-start]::before]:[--pomodoro-pause-span:calc(2rem+var(--pomodoro-pause-overlap))]
                [&[data-row-start]::before]:mask-size-[4rem_100%]
                [&[data-row-start]::before]:mask-no-repeat
                [&[data-row-start]::before]:mask-[linear-gradient(to_right,#000_0%_4%,transparent_4%_7%,#000_7%_13.5%,transparent_13.5%_16.5%,#000_16.5%_27.5%,transparent_27.5%_30.5%,#000_30.5%_100%)]
                [&::after]:bg-transparent [&::after]:bg-origin-border [&::after]:text-transparent [&::after]:border-transparent
                [&::after]:bg-[conic-gradient(var(--color-primary-content)_calc(var(--pomodoro-progress-ratio)*1turn),var(--color-base-content)_0),conic-gradient(var(--color-primary)_calc(var(--pomodoro-progress-ratio)*1turn),var(--color-base-300)_0)]
                [&::after]:[background-clip:text,border-box]
                ${isReached ? "step-primary" : ""}
            `}
            style={{
                [PROGRESS_RATIO_PROPERTY]: endsAtMs === null ? ratio : undefined,
                [PAUSE_RATIO_PROPERTY]: pauseEndsAtMs === null ? pauseRatio : undefined,
            } as CSSProperties}
            data-lower-row={isLowerRow || undefined}
            data-row-start={isRowStart || undefined}
            aria-current={isCurrent ? "step" : undefined}
            aria-label={`Foco ${index + 1} de ${focusCount}: ${state}. Progresso: ${percentage}%.${pauseLabel}`}
        />
    );
});

function CycleSteps({
    focusProgress, currentFocusIndex, isCurrentFocusComplete, phase, phaseDurationMs, phaseRemainingMs, endsAtMs, transitionId,
}: CycleStepsProps) {
    const focusCount = focusProgress.length;
    const isSingleRow = focusCount <= 4;
    const columnCount = isSingleRow ? focusCount : Math.ceil(focusCount / 2);
    const unscaledHeight = "calc(80px + 0.5rem)";
    // Use the widest configuration for every count, keeping single-row circles the same size.
    // Preserve the width budget when shortening the entry, so the circles do not change size.
    const maxColumnCount = Math.ceil(POMODORO_SETTINGS_LIMITS.maxFocusPhases / 2);
    const unscaledWidth = `${maxColumnCount * 4 + (CENTER_LOWER_ROW_WITH_CONNECTOR ? 1 : 4)}rem`;

    return (
        <div
            className="relative left-1/2 grid w-screen min-h-0 min-w-0 -translate-x-1/2 overflow-visible"
            style={{ gridTemplateColumns: STEPS_HORIZONTAL_GRID }}
        >
            <div
                className="relative col-start-2 w-full min-h-0 min-w-0 @container-size"
                // Fit the same reference geometry, capped by the panel's original row budget.
                // The panel distributes released height to its gaps without resizing the Steps.
                style={{
                    aspectRatio: `calc(${unscaledWidth} / ${unscaledHeight})`,
                    maxHeight: "calc(100cqh * var(--pomodoro-steps-row-ratio, 1))",
                }}
            >
                <div
                    className="absolute top-1/2 left-1/2 flex w-max -translate-x-1/2 -translate-y-1/2 flex-col"
                    // Steps may exceed the panel cell, but must fit within the central grid track.
                    style={{
                        "--pomodoro-steps-scale": `min(calc(100cqh / ${unscaledHeight}), calc(100cqw / ${unscaledWidth}))`,
                        scale: "var(--pomodoro-steps-scale)",
                    } as CSSProperties}
                >
                    {/* Each spacer replaces half of a second native row and its gap. */}
                    {isSingleRow && <div aria-hidden="true" className="h-[calc(20px+0.25rem)] shrink-0" />}
                    <ol
                        // Keep DaisyUI's base background/text; palette reference: context/architecture.md.
                        // Wrap native-size items and center each row; allow the lower entry to overflow.
                        className="steps pomodoro-steps flex flex-wrap justify-center gap-y-2 w-[calc(var(--pomodoro-steps-columns)*4rem)] overflow-visible [--color-primary:#fde047] [--color-primary-content:#F5911F] [--color-base-content:#212940] [--color-base-300:#2B416B]"
                        style={{ "--pomodoro-steps-columns": columnCount } as CSSProperties}
                        aria-label={`Progresso dos ${focusCount} focos do ciclo`}
                    >
                        {focusProgress.map((progress, index) => {
                            const isCurrent = index === currentFocusIndex && !isCurrentFocusComplete;
                            const isCurrentBreak = phase === "shortBreak" && index === currentFocusIndex + 1;
                            const pauseRatio = index > 0 && index <= currentFocusIndex ? 1
                                : isCurrentBreak && phaseDurationMs > 0
                                    ? Math.max(0, Math.min(1, (phaseDurationMs - phaseRemainingMs) / phaseDurationMs)) : 0;
                            return (
                                <CycleStep
                                    key={index}
                                    index={index}
                                    focusCount={focusCount}
                                    progress={progress}
                                    isCurrent={isCurrent}
                                    isReached={index <= currentFocusIndex}
                                    isLowerRow={CENTER_LOWER_ROW_WITH_CONNECTOR && index >= columnCount}
                                    isRowStart={!isSingleRow && index === columnCount}
                                    phaseDurationMs={isCurrent ? phaseDurationMs : 0}
                                    endsAtMs={isCurrent ? endsAtMs : null}
                                    pauseRatio={pauseRatio}
                                    pauseDurationMs={isCurrentBreak ? phaseDurationMs : 0}
                                    pauseEndsAtMs={isCurrentBreak ? endsAtMs : null}
                                    transitionId={transitionId}
                                />
                            );
                        })}
                    </ol>
                    {isSingleRow && <div aria-hidden="true" className="h-[calc(20px+0.25rem)] shrink-0" />}
                </div>
            </div>
        </div>
    );
}

export default CycleSteps;
