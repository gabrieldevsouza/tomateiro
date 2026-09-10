import TimerControlButton from "./TimerControlButton";

function SkipCycleButton() {
	return (
		<TimerControlButton 
			ariaLabel="Pular ciclo"
			bgColor= "bg-[#374468]"
			icon = {
				<svg
					viewBox="0 0 24 24"
					fill="currentColor"
					className="size-1/2"
				>
					<path d="src/assets/React.svg" />
				</svg>
			}
		>
			
		</TimerControlButton>
	);
}

export default SkipCycleButton;
