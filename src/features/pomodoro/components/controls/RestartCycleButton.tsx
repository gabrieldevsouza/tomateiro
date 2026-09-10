import ReactSvg from "../../../../assets/react.svg";
import TimerControlButton from "./TimerControlButton";

function RestartCycleButton() {
	return (
		<TimerControlButton
			ariaLabel = "Reiniciar ciclo"
			bgColor = "bg-[#374468]"
			icon = {
				<img src={ReactSvg} alt="" aria-hidden="true" className="size-1/2" />
			}
		/>
	);
}

export default RestartCycleButton;
