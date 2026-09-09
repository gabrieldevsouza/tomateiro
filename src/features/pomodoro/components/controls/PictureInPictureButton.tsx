import TimerControlButton from "./TimerControlButton";

function PictureInPictureButton() {
	return (
		<TimerControlButton ariaLabel=
		"Ativar picture-in-picture"
		bgColor="bg-[#212940]"
		>
			<span aria-hidden="true">PiP</span>
		</TimerControlButton>
	);
}

export default PictureInPictureButton;
