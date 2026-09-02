import TimerControlButton from "./TimerControlButton";

function RestartCycleButton({ onClick }: { onClick: () => void }) {
	return (
		<TimerControlButton ariaLabel="Reiniciar ciclo" onClick={onClick}>
			<span aria-hidden="true">↻</span>
		</TimerControlButton>
	);
}

export default RestartCycleButton;
