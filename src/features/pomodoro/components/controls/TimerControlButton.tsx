import type { ReactNode } from "react";

enum CircularProgressOrientation {Horizontal,Vertical}

interface TimerControlButtonProps {
	ariaLabel: string;
	children: ReactNode;
	title?: string;
	orientation?: CircularProgressOrientation;
};

function TimerControlButton({
	ariaLabel,
	children,
	title = ariaLabel,
	orientation = CircularProgressOrientation.Horizontal,
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
				
				rounded-full
				bg-red-400
				shrink
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
