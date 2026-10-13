import type { CSSProperties } from "react";
import type { PomodoroPhase } from "../model/pomodoroTimer";
import ProgressIndicator from "./ProgressIndicator";
import CircularProgress from "./pomodoroViewer/CircularProgressLegacy";

type CycleStepsProps = {
    focusProgress: number[];
    currentFocusIndex: number;
    isCurrentFocusComplete: boolean;
    transitionId: number;
    phase: PomodoroPhase;
    phaseDurationMs: number;
    phaseRemainingMs: number;
    endsAtMs: number | null;
};

function CycleSteps({
    focusProgress,
    currentFocusIndex,
    isCurrentFocusComplete,
    transitionId,
    phase,
    phaseDurationMs,
    phaseRemainingMs,
    endsAtMs,
}: CycleStepsProps) {
    const focusCount = focusProgress.length;
    const columnCount = Math.min(focusCount, 6);
    const rowCount = Math.ceil(focusCount / columnCount);
    const style = {
        display: rowCount > 1 ? "grid" : undefined,
        "--cycle-step-size": `min(calc(100cqh / ${rowCount === 1 ? 1 : 2.5}), calc(100cqw / ${columnCount}))`,
        "--cycle-step-row-gap": rowCount === 1 ? "0px" : "calc(var(--cycle-step-size) * 0.5)",
        gridTemplateColumns: columnCount === 1
            ? "var(--cycle-step-size)"
            : `var(--cycle-step-size) repeat(${columnCount - 1}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
        rowGap: "var(--cycle-step-row-gap)",
    } as CSSProperties;

    return (
        <div className="grid h-full w-full grid-cols-[minmax(0,16fr)_minmax(0,43fr)_minmax(0,16fr)]">
            <div className="col-start-2 h-full min-h-0 min-w-0 @container-size">
                <ol
                    className="steps pomodoro-cycle-steps h-full w-full font-[Inter] leading-none"
                    aria-label={focusCount === 1 ? "Progresso do foco do ciclo" : `Progresso dos ${focusCount} focos do ciclo`}
                    style={style}
                >
                    {focusProgress.map((progress, index) => {
                        const isCurrent = index === currentFocusIndex;
                        const isRowStart = index > 0 && index % columnCount === 0;
                        const isCurrentBreak = phase === "shortBreak" && index === currentFocusIndex + 1;
                        const state = index < currentFocusIndex || (isCurrent && isCurrentFocusComplete)
                            ? "percorrido"
                            : isCurrent ? "atual" : "próximo";

                        return (
                            <li
                                key={index}
                                className={isRowStart ? "step pomodoro-cycle-row-start" : "step"}
                                aria-current={isCurrent && !isCurrentFocusComplete ? "step" : undefined}
                            >
                                {index > 0 && (
                                    <ProgressIndicator
                                        variant={isRowStart ? "connector-return" : "connector"}
                                        ariaLabel={`Progresso da pausa entre os focos ${index} e ${index + 1}`}
                                        totalDurationMs={isCurrentBreak ? phaseDurationMs : 1}
                                        remainingMs={index <= currentFocusIndex ? 0 : isCurrentBreak ? phaseRemainingMs : 1}
                                        phaseDurationMs={isCurrentBreak ? phaseDurationMs : 0}
                                        endsAtMs={isCurrentBreak ? endsAtMs : null}
                                        transitionId={transitionId}
                                    />
                                )}
                                <div className="step-icon" aria-hidden="true">
                                    <div className="absolute inset-0">
                                        <CircularProgress value={progress} transitionId={transitionId} />
                                    </div>
                                    <span className="relative">{index + 1}</span>
                                </div>
                                <span className="sr-only">Foco {index + 1} de {focusCount}: {state}. Progresso: {progress}%</span>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
}

export default CycleSteps;
