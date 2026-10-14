type CycleStepsProps = {
    focusCount: number;
    currentFocusIndex: number;
    isCurrentFocusComplete: boolean;
};

function CycleSteps({ focusCount, currentFocusIndex, isCurrentFocusComplete }: CycleStepsProps) {
    return (
        <div className="relative h-full w-full min-h-0 min-w-0 @container-size">
            <div
                className="absolute top-1/2 left-1/2 flex w-max -translate-x-1/2 -translate-y-1/2"
                // Fit the native 40px row and 4rem steps without changing their internal styles.
                style={{ scale: `min(1, calc(100cqh / 40px), calc(100cqw / ${focusCount * 4}rem))` }}
            >
                <ol className="steps" aria-label={`Progresso dos ${focusCount} focos do ciclo`}>
                    {Array.from({ length: focusCount }, (_, index) => {
                        const isCurrent = index === currentFocusIndex && !isCurrentFocusComplete;
                        const state = index < currentFocusIndex || (index === currentFocusIndex && isCurrentFocusComplete)
                            ? "percorrido"
                            : isCurrent ? "atual" : "próximo";

                        return (
                            <li
                                key={index}
                                className={index <= currentFocusIndex ? "step step-primary" : "step"}
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
