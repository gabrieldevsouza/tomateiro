/*import ReactSvg from "../../../../assets/react.svg";*/
import TimerControlButton from "./TimerControlButton";
import { TbPictureInPicture } from "react-icons/tb";

function PictureInPictureButton() {
    return (
        <TimerControlButton
            ariaLabel="Ativar picture-in-picture"
            
            icon={<TbPictureInPicture className="
				border-red-600
				
				w-[65%]
				h-[65%]
				
			" />}
			bgColor="bg-[#374468]"
        />
    );
}

export default PictureInPictureButton;
