import ReactSvg from "../../../../assets/react.svg";
import TimerControlButton from "./TimerControlButton";

function PictureInPictureButton() {
    return (
        <TimerControlButton
            ariaLabel="Ativar picture-in-picture"
            bgColor="bg-[#374468]"
            icon={
                <img src={ReactSvg} alt="" aria-hidden="true" className="size-1/2" />
            }
        />
    );
}

export default PictureInPictureButton;
