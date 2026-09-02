import TimerControlButton from "./TimerControlButton";

function SkipCycleButton({ onClick }: { onClick: () => void }) {
	return (
		<TimerControlButton ariaLabel="Pular ciclo" onClick={onClick}>
			<span aria-hidden="true">⏭</span>
		</TimerControlButton>
	);
}

export default SkipCycleButton;
