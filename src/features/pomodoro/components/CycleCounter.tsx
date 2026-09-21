import CircularProgress from "./pomodoroViewer/CircularProgress";

type CycleCounterProps = {
    focusProgress: number[];
};

function CycleCounter({ focusProgress }: CycleCounterProps) {
    const alignment = focusProgress.length === 1 ? "justify-center" : "justify-between";
    return (
        <div
            role="group"
            aria-label={focusProgress.length === 1 ? "Progresso do foco do ciclo" : `Progresso dos ${focusProgress.length} focos do ciclo`}
            className="
                h-full
                w-full

                grid

                grid-cols-[minmax(0,16fr)_minmax(0,43fr)_minmax(0,16fr)]
            "
        >
            <div
                className={`
                    col-start-2
                    min-h-0
                    min-w-0

                    flex
                    flex-row
                    ${alignment}
                    items-center
                `}
            >
                {focusProgress.map((progress, index) => (
                    <CircularProgress key={index} value={progress} />
                ))}
            </div>
        </div>
    );
}

export default CycleCounter;
