import type { CSSProperties } from "react";

type CycleStepsProps = {
    focusCount: number;
    currentFocusIndex: number;
    isCurrentFocusComplete: boolean;
};

function CycleSteps({ focusCount, currentFocusIndex, isCurrentFocusComplete }: CycleStepsProps) {
    const columnCount = focusCount <= 4 ? focusCount : Math.ceil(focusCount / 2);
    const unscaledHeight = focusCount <= 4 ? "40px" : "calc(80px + 0.5rem)";

    return (
        <div className="relative h-full w-full min-h-0 min-w-0 @container-size">
            <div
                className="absolute top-1/2 left-1/2 flex w-max -translate-x-1/2 -translate-y-1/2"
                // Scale native 40px rows and 4rem steps together, including the gap between rows.
                style={{ scale: `min(calc(100cqh / ${unscaledHeight}), calc(100cqw / ${columnCount * 4}rem))` }}
            >
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
                                data-row-start={index === columnCount || undefined}
                                aria-current={isCurrent ? "step" : undefined}
                                aria-label={`Foco ${index + 1} de ${focusCount}: ${state}`}
                            />
                        );
                    })}
                </ol>
            </div>
        </div>
    );
}

export default CycleSteps;
