import type { CSSProperties } from "react";

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

    return (
        <div className="relative h-full w-full min-h-0 min-w-0 overflow-visible @container-size">
            <div
                className="absolute top-1/2 left-1/2 flex w-max -translate-x-1/2 -translate-y-1/2 flex-col"
                // Fit the cell height; only Steps may extend beyond the cell horizontally.
                style={{ scale: `calc(100cqh / ${unscaledHeight})` }}
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
    );
}

export default CycleSteps;
