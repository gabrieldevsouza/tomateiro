import ReactSvg from "../../../../assets/react.svg";
import TimerControlButton from "./TimerControlButton";

function SkipCycleButton() {
	return (
		<TimerControlButton 
			ariaLabel="Pular ciclo"
			bgColor= "bg-[#374468]"
			icon = {
				<img src={ReactSvg} alt="" aria-hidden="true" className="size-1/2" />
			}
		>
			
		</TimerControlButton>
	);
}

export default SkipCycleButton;
