import ReactSvg from "../../../../assets/react.svg";
import TimerControlButton from "./TimerControlButton";


function PlayButton() {
	return (
		<TimerControlButton 
			ariaLabel="Iniciar ciclo"
			bgColor= "bg-[#00CBEA]"
			icon={
				<img src={ReactSvg} alt="" aria-hidden="true" className="size-1/2" />
			}
		/>
	);
}

export default PlayButton;
