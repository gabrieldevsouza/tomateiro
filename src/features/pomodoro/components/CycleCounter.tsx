import CircularProgress from "./pomodoroViewer/CircularProgress";

type CycleCounterProps = {
    focusProgress: number[];
};

function CycleCounter({ focusProgress }: CycleCounterProps) {
    return (
        <div
            role="group"
            aria-label="Progresso dos quatro focos do ciclo"
            className="
                h-full
                w-full

                grid

                grid-cols-[minmax(0,16fr)_minmax(0,43fr)_minmax(0,16fr)]
            "
        >
            <div
                className="
                    col-start-2
                    min-h-0
                    min-w-0

                    flex
                    flex-row
                    justify-between
                    items-center
                "
            >
                <CircularProgress value={focusProgress[0]} />
                <CircularProgress value={focusProgress[1]} />
                <CircularProgress value={focusProgress[2]} />
                <CircularProgress value={focusProgress[3]} />
            </div>
        </div>
    );
}

export default CycleCounter;
