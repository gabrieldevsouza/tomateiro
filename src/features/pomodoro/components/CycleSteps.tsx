import type { CSSProperties } from "react";
import { POMODORO_SETTINGS_LIMITS } from "../model/pomodoroTimer";

// Colunas: lateral / Steps / lateral. 3 / 34 / 3 reserva 7,5% em cada ponta.
const STEPS_HORIZONTAL_GRID = "minmax(0, 3fr) minmax(0, 34fr) minmax(0, 3fr)";

// true: centraliza círculos + linha de entrada; false: centraliza somente os círculos.
const CENTER_LOWER_ROW_WITH_CONNECTOR = true;

type CycleStepsProps = {
    focusCount: number;
    currentFocusIndex: number;
    isCurrentFocusComplete: boolean;
};

function CycleSteps({ focusCount, currentFocusIndex, isCurrentFocusComplete }: CycleStepsProps) {
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
                    style={{ scale: `min(calc(100cqh / ${unscaledHeight}), calc(100cqw / ${unscaledWidth}))` }}
                >
                    {/* Each spacer replaces half of a second native row and its gap. */}
                    {isSingleRow && <div aria-hidden="true" className="h-[calc(20px+0.25rem)] shrink-0" />}
                    <ol
                        className="steps pomodoro-steps"
                        style={{ "--pomodoro-steps-columns": columnCount } as CSSProperties}
                        aria-label={`Progresso dos ${focusCount} focos do ciclo`}
                    >
                        {Array.from({ length: focusCount }, (_, index) => {
                            const isCurrent = index === currentFocusIndex && !isCurrentFocusComplete;
                            const state = index < currentFocusIndex || (index === currentFocusIndex && isCurrentFocusComplete)
                                ? "percorrido"
                                : isCurrent ? "atual" : "próximo";

                            return (
                                <li
                                    key={index}
                                    className={index <= currentFocusIndex ? "step step-primary" : "step"}
                                    data-lower-row={(CENTER_LOWER_ROW_WITH_CONNECTOR && index >= columnCount) || undefined}
                                    aria-current={isCurrent ? "step" : undefined}
                                    aria-label={`Foco ${index + 1} de ${focusCount}: ${state}`}
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
