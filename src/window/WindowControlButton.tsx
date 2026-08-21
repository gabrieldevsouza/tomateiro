import type { ReactNode } from "react";

const WINDOW_CONTROL_MIN_WIDTH = "1.75rem";
const WINDOW_CONTROL_PREFERRED_WIDTH = "7dvw";
const WINDOW_CONTROL_MAX_WIDTH = "2.5rem";

const WINDOW_CONTROL_WIDTH =
	`clamp(
		${WINDOW_CONTROL_MIN_WIDTH},
		${WINDOW_CONTROL_PREFERRED_WIDTH},
		${WINDOW_CONTROL_MAX_WIDTH}
	)`;

type WindowControlButtonProps = {
	ariaLabel: string;
	title?: string;
	children: ReactNode;
	onClick: () => void;
	variant?: "default" | "danger";
};

function WindowControlButton({
	ariaLabel,
	title = ariaLabel,
	children,
	onClick,
	variant = "default",
}: WindowControlButtonProps) {
	const variantClass =
		variant === "danger"
			? "hover:bg-error hover:text-error-content"
			: "";

	return (
		<button
			type="button"
			className={`
				btn
				btn-ghost
				min-h-0
				shrink-0
				overflow-hidden
				rounded-none
				leading-none
				${variantClass}
			`}
			style={{
				height: "100%",
				width: WINDOW_CONTROL_WIDTH,
				minWidth: WINDOW_CONTROL_WIDTH,
				maxWidth: WINDOW_CONTROL_WIDTH,
				padding: 0,
				border: "none",
				boxShadow: "none",
				textShadow: "none",
			}}
			aria-label={ariaLabel}
			title={title}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

export default WindowControlButton;