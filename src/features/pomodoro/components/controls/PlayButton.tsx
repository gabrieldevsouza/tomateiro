import TimerControlButton from "./TimerControlButton";
import { PiPlayFill } from "react-icons/pi";


function PlayButton() {
	return (
		<TimerControlButton 
			ariaLabel="Iniciar ciclo"
			icon={<PiPlayFill className="
				fill-[#FFFFFF]

				w-[70%]
				h-[70%]

			" />}
			bgColor="bg-[#00CBEA]"
		/>
	);
}

export default PlayButton;
