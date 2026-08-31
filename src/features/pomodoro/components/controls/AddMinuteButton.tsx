import TimerControlButton from "./TimerControlButton";

function AddMinuteButton() {
	return (
		<TimerControlButton ariaLabel="Adicionar um minuto">
			<span aria-hidden="true">+1</span>
		</TimerControlButton>
	);
}

export default AddMinuteButton;
