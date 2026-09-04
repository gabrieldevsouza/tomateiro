type TimerDisplayProps = {
    remainingMs: number;
};

function TimerDisplay({
    remainingMs,
}: TimerDisplayProps) {
    const totalSeconds = Math.ceil(
        remainingMs / 1_000,
    );

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return (
        <div
            className="
                grid
                h-full
                w-full
                grid-cols-[minmax(0,43fr)_minmax(0,92fr)_minmax(0,43fr)]
                bg-green-500
            "
        >
            <div
                className="
                    col-start-1
                    min-h-0
                    min-w-0
                    bg-fuchsia-500
                "
            />

            <div
                className="
                    col-start-2
                    min-h-0
                    min-w-0
                    bg-blue-400
                "
            >
                <time
                    dateTime={`PT${totalSeconds}S`}
                    className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        text-4xl
                        font-medium
                        leading-none
                        tabular-nums
                    "
                    aria-label={`${minutes} minutos e ${seconds} segundos restantes`}
                >
                    {formattedTime}
                </time>
            </div>

            <div
                className="
                    col-start-3
                    min-h-0
                    min-w-0
                    bg-emerald-400
                "
            />
        </div>
    );
}

export default TimerDisplay;