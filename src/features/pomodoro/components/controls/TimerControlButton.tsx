import type { ReactNode } from "react";

enum CircularProgressOrientation { Horizontal, Vertical}

interface TimerControlButtonProps {
    ariaLabel: string;
    title?: string;
    
    orientation?: CircularProgressOrientation;
    
    icon: ReactNode;

    bgColor?: string;

    hoverColor?: string;
    activeColor?: string;
};

function TimerControlButton({
    ariaLabel,
    icon: icon,
    title = ariaLabel,
    orientation = CircularProgressOrientation.Horizontal,
    bgColor = "bg-red-400",
    hoverColor = "hover:bg-[#5F77B8]",
    activeColor = "active:bg-[#1D2230]",
    
}: TimerControlButtonProps) {
    const sizeClassName =
        orientation === CircularProgressOrientation.Vertical
            ? "h-auto w-full"
            : "h-full w-auto";
    return (
        <button
            type="button"
            className={`
				btn
				btn-ghost
				
				p-0

				min-h-0
				min-w-0

				${bgColor}
                ${hoverColor}
                ${activeColor}

				border-0
				shadow-none
				bg-none
				text-[#C2C7DA]

				hover:brightness-110
				active:brightness-90
				transition-[background-color,filter]

				outline-none
				focus-visible:outline-2
				focus-visible:outline-solid
				focus-visible:outline-[#C2C7DA]
				focus-visible:outline-offset-4

				rounded-full
				shrink-0
				aspect-square
				${sizeClassName}

				flex
			`}
            aria-label={ariaLabel}
            title={title}
        >
            {icon}
        </button>
    );
}

export default TimerControlButton;