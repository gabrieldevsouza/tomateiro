/*import ReactSvg from "../../../../assets/react.svg";*/
import TimerControlButton from "./TimerControlButton";
import { MdOutlineReplay } from "react-icons/md";

function RestartCycleButton() {
	return (
		<TimerControlButton
			ariaLabel = "Reiniciar ciclo"
		
			icon={<MdOutlineReplay className="
				fill-[#C2C7DA]
				
				w-[65%]
				h-[65%]
				
			"/>}
			bgColor = "bg-[#374468]"
		/>
	);
}

export default RestartCycleButton;
