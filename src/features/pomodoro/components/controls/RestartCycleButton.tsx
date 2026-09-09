import TimerControlButton from "./TimerControlButton";

function RestartCycleButton() {
	return (
		<TimerControlButton ariaLabel="Reiniciar ciclo"
		bgColor= "bg-[#374468]"
		>
			<span aria-hidden="true">↻</span>
		</TimerControlButton>
	);
}

export default RestartCycleButton;
