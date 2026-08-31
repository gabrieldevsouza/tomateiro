import TimerControlButton from "./TimerControlButton";

function SkipCycleButton() {
	return (
		<TimerControlButton ariaLabel="Pular ciclo">
			<span aria-hidden="true">⏭</span>
		</TimerControlButton>
	);
}

export default SkipCycleButton;
