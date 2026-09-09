import TimerControlButton from "./TimerControlButton";

function AddMinuteButton() {
	return (
		<TimerControlButton ariaLabel=
		"Adicionar um minuto"
		bgColor= "bg-[#374468]"
		>
			<span aria-hidden="true">+1</span>
		</TimerControlButton>
	);
}

export default AddMinuteButton;
