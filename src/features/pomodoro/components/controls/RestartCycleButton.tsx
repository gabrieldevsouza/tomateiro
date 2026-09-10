import TimerControlButton from "./TimerControlButton";

function RestartCycleButton() {
	return (
		<TimerControlButton
			ariaLabel = "Reiniciar ciclo"
			bgColor = "bg-[#374468]"
			icon = {
				<svg
					viewBox="0 0 24 24"
					fill="currentColor"
					className="size-1/2"
				>
					<path d="src/assets/React.svg" />
				</svg>
			}
		/>
	);
}

export default RestartCycleButton;
