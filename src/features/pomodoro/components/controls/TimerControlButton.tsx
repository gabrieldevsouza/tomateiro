import type { ReactNode } from "react";

enum CircularProgressOrientation {Horizontal,Vertical}

interface TimerControlButtonProps {
	ariaLabel: string;
	title?: string;
	
	orientation?: CircularProgressOrientation;
	
	children: ReactNode;

	bgColor?: string;
};

function TimerControlButton({
	ariaLabel,
	children,
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
				btn-ghost
				
				min-h-0
				min-w-0
				
				${bgColor}
				
				rounded-full
				shrink
				aspect-square
				${sizeClassName}
			`}
			aria-label={ariaLabel}
			title={title}
		>
			{children}
		</button>
	);
}

export default TimerControlButton;
