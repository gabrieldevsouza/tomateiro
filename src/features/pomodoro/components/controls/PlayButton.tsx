import TimerControlButton from "./TimerControlButton";
import { PiPauseFill, PiPlayFill } from "react-icons/pi";


type PlayButtonProps = {
	isRunning: boolean;
	onStart: () => void;
	onPause: () => void;
};

function PlayButton({ isRunning, onStart, onPause }: PlayButtonProps) {
	const ariaLabel = isRunning ? "Pausar ciclo" : "Iniciar ciclo";
	const Icon = isRunning ? PiPauseFill : PiPlayFill;

	return (
		<TimerControlButton
			ariaLabel={ariaLabel}
			onClick={isRunning ? onPause : onStart}
			icon={<Icon aria-hidden="true" className="
				fill-[#FFFFFF]

				w-[70%]
				h-[70%]

			" />}
			bgColor="bg-[#00CBEA]"
			hoverColor="hover:bg-[#0473B8]"
		/>
	);
}

export default PlayButton;
