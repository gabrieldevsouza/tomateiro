import TimerControlButton from "./TimerControlButton";

function PlayButton({ onClick }: { onClick: () => void }) {
	return (
		<TimerControlButton ariaLabel="Iniciar ciclo" onClick={onClick}>
			<span aria-hidden="true">▶</span>
		</TimerControlButton>
	);
}

export default PlayButton;
