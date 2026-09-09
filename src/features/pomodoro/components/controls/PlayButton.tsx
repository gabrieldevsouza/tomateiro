import TimerControlButton from "./TimerControlButton";


function PlayButton() {
	return (
		<TimerControlButton 
			ariaLabel="Iniciar ciclo"
			bgColor= "bg-[#00CBEA]"
		>
			<span aria-hidden="true">▶</span>
			
		</TimerControlButton>
	);
}

export default PlayButton;
