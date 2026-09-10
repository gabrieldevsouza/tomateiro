import type { ReactNode } from "react";

enum CircularProgressOrientation { Horizontal, Vertical}

interface TimerControlButtonProps {
    ariaLabel: string;
    title?: string;
    
    orientation?: CircularProgressOrientation;
    
    icon: ReactNode;

    bgColor?: string;
};

function TimerControlButton({
    ariaLabel,
    icon: icon,
    title = ariaLabel,
    orientation = CircularProgressOrientation.Horizontal,
    bgColor = "bg-red-400",
    
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
                p-0
                btn-ghost
                
                min-h-0
                min-w-0
                
                ${bgColor}

                hover:bg-red-500
                active:bg-red-600

                
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