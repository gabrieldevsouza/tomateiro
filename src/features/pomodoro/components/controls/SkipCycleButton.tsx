import TimerControlButton from "./TimerControlButton";

function SkipCycleButton() {
	return (
		<TimerControlButton 
		ariaLabel="Pular ciclo"
		bgColor= "bg-[#374468]"
		>
			<span aria-hidden="true">⏭</span>
		</TimerControlButton>
	);
}

export default SkipCycleButton;
