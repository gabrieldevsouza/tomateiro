import TimerControlButton from "./TimerControlButton";

function AddMinuteButton({ onClick }: { onClick: () => void }) {
	return (
		<TimerControlButton ariaLabel="Adicionar um minuto" onClick={onClick}>
			<span aria-hidden="true">+1</span>
		</TimerControlButton>
	);
}

export default AddMinuteButton;
