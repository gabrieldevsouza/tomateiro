import { memo, useRef, type CSSProperties } from "react";
import { POMODORO_SETTINGS_LIMITS, type PomodoroPhase } from "../model/pomodoroTimer";
import { PROGRESS_RATIO_PROPERTY, useProgressAnimation } from "./useProgressAnimation";

// Colunas: lateral / Steps / lateral. 3 / 34 / 3 reserva 7,5% em cada ponta.
const STEPS_HORIZONTAL_GRID = "minmax(0, 3fr) minmax(0, 34fr) minmax(0, 3fr)";

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
            className={isReached ? "step step-primary" : "step"}
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
    // The native entry connector needs 1rem extra when centered, or 4rem without compensation.
    const maxColumnCount = Math.ceil(POMODORO_SETTINGS_LIMITS.maxFocusPhases / 2);
    const unscaledWidth = `${maxColumnCount * 4 + (CENTER_LOWER_ROW_WITH_CONNECTOR ? 1 : 4)}rem`;

    return (
        <div
            className="relative left-1/2 grid h-full w-screen min-h-0 min-w-0 -translate-x-1/2 overflow-visible"
            style={{ gridTemplateColumns: STEPS_HORIZONTAL_GRID }}
        >
            <div className="relative col-start-2 h-full min-h-0 min-w-0 @container-size">
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
                        className="steps pomodoro-steps"
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
