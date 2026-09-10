/*import ReactSvg from "../../../../assets/react.svg";*/
import TimerControlButton from "./TimerControlButton";
import { IoPlaySkipForward } from "react-icons/io5";

function SkipCycleButton() {
	return (
		<TimerControlButton 
			ariaLabel="Pular ciclo"
			
			icon = {<IoPlaySkipForward className="
				fill-[#C2C7DA]


				w-[65%]
				h-[65%]
				
				"


			/>}
			bgColor= "bg-[#374468]"
		/>
	);
}

export default SkipCycleButton;
