import TimerControlButton from "./TimerControlButton";

type PlayButtonProps = {
    isRunning: boolean;
    onStart: () => void;
    onPause: () => void;
};

function PlayButton({
    isRunning,
    onStart,
    onPause,
}: PlayButtonProps) {
    const ariaLabel = isRunning
        ? "Pausar ciclo"
        : "Iniciar ciclo";

    const icon = isRunning ? "Ⅱ" : "▶";

    return (
        <TimerControlButton
            ariaLabel={ariaLabel}
            onClick={isRunning ? onPause : onStart}
        >
            <span aria-hidden="true">
                {icon}
            </span>
        </TimerControlButton>
    );
}

export default PlayButton;