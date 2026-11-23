import TimerControlButton from "./TimerControlButton";
import { TbPictureInPicture } from "react-icons/tb";

function PictureInPictureButton() {
    return (
        <TimerControlButton
            ariaLabel="Picture-in-picture (unavailable)"
            title="Not available yet"
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
