import TimerControlButton from "./TimerControlButton";

function PictureInPictureButton() {
	return (
		<TimerControlButton ariaLabel="Ativar picture-in-picture">
			<span aria-hidden="true">PiP</span>
		</TimerControlButton>
	);
}

export default PictureInPictureButton;
