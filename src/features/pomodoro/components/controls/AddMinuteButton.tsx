/*import ReactSvg from "../../../../assets/react.svg";*/
import TimerControlButton from "./TimerControlButton";
import { MdOutlinePlusOne } from "react-icons/md";

function AddMinuteButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
	return (
		<TimerControlButton
			onClick={onClick}
			disabled={disabled}
			title={disabled ? "Can't add a minute to a completed phase or exceed the 99:59:59 limit." : "Add 1 minute"}
			ariaLabel="Add 1 minute"
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
