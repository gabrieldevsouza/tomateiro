import { PiPencilSimple } from "react-icons/pi";
import TimerControlButton from "./TimerControlButton";

function EditTimerButton({ onClick }: { onClick: () => void }) {
	return (
		<TimerControlButton
			ariaLabel="Editar tempos e ciclos"
			onClick={onClick}
			icon={<PiPencilSimple aria-hidden="true" className="h-[55%] w-[55%] fill-[#00CBEA]" />}
			bgColor="bg-transparent"
			className="relative ring-1 ring-inset ring-[#00CBEA]/60 after:absolute after:left-1/2 after:top-1/2 after:size-[max(100%,2rem)] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full"
			hoverColor="hover:bg-[#00CBEA]/10"
			activeColor="active:bg-[#00CBEA]/20"
		/>
	);
}

export default EditTimerButton;
