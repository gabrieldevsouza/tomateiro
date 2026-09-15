import CircularProgress from "./pomodoroViewer/CircularProgress";

type CycleCounterProps = {
    completedFocusCycles: number;
};

function CycleCounter({ completedFocusCycles }: CycleCounterProps) {
    // Mantém os quatro indicadores cheios até a conclusão do próximo foco.
    const completedCyclesInSet = completedFocusCycles > 0
        ? ((completedFocusCycles - 1) % 4) + 1
        : 0;

    return (
        <div
            role="group"
            aria-label={`${completedFocusCycles} ciclos de foco concluídos`}
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
                <CircularProgress value={completedCyclesInSet >= 1 ? 100 : 0} />
                <CircularProgress value={completedCyclesInSet >= 2 ? 100 : 0} />
                <CircularProgress value={completedCyclesInSet >= 3 ? 100 : 0} />
                <CircularProgress value={completedCyclesInSet >= 4 ? 100 : 0} />
            </div>
        </div>
    );
}

export default CycleCounter;
