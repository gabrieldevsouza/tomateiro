/*import ReactSvg from "../../../../assets/react.svg";*/
import TimerControlButton from "./TimerControlButton";
import { MdOutlinePlusOne } from "react-icons/md";

function AddMinuteButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
	return (
		<TimerControlButton
			onClick={onClick}
			disabled={disabled}
			title={disabled ? "Não é possível adicionar um minuto à etapa concluída ou acima do limite de 99:59:59." : "Adicionar um minuto"}
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
