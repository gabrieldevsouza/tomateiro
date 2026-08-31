import TimerControlButton from "./TimerControlButton";

function RestartCycleButton() {
	return (
		<TimerControlButton ariaLabel="Reiniciar ciclo">
			<span aria-hidden="true">↻</span>
		</TimerControlButton>
	);
}

export default RestartCycleButton;
