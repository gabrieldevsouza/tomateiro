/*import ReactSvg from "../../../../assets/react.svg";*/
import TimerControlButton from "./TimerControlButton";
import { MdOutlinePlusOne } from "react-icons/md";

function AddMinuteButton({ onClick }: { onClick: () => void }) {
	return (
		<TimerControlButton
			onClick={onClick}
			ariaLabel="Adicionar um minuto"
			icon={<MdOutlinePlusOne className="
				fill-[#C2C7DA]

			w-[65%]
			h-[65%]

		"/>}
		bgColor= "bg-[#374468]"
		/>

	);
}

export default AddMinuteButton;
