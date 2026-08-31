import TimerControlButton from "./TimerControlButton";

function PlayButton() {
	return (
		<TimerControlButton ariaLabel="Iniciar ciclo">
			<span aria-hidden="true">▶</span>
		</TimerControlButton>
	);
}

export default PlayButton;
