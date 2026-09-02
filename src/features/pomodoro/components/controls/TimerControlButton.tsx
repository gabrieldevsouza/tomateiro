import type { ReactNode } from "react";

type TimerControlButtonProps = {
	ariaLabel: string;
	children: ReactNode;
	title?: string;
	onClick?: () => void;
};

function TimerControlButton({
	ariaLabel,
	children,
	title = ariaLabel,
	onClick,
}: TimerControlButtonProps) {
	return (
		<button
			type="button"
			className="
				btn
				btn-ghost
				h-full
				w-full
				min-h-0
				min-w-0
				overflow-hidden
				rounded-none
				p-0
				leading-none
			"
			aria-label={ariaLabel}
			 title={title}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

export default TimerControlButton;
