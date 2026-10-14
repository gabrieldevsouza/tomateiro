import TimerControlButton from "./TimerControlButton";
import { TbPictureInPicture } from "react-icons/tb";

function PictureInPictureButton() {
    return (
        <TimerControlButton
            ariaLabel="Picture-in-picture indisponível"
            title="Picture-in-picture ainda não disponível"
            disabled

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
