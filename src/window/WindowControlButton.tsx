import type { ReactNode } from "react";

const WINDOW_CONTROL_WIDTH = "var(--window-control-width)";

type WindowControlButtonProps = {
	ariaLabel: string;
	title?: string;
	children: ReactNode;
	onClick: () => void;
	variant?: "default" | "danger";
	pressed?: boolean;
	disabled?: boolean;
	busy?: boolean;
};

function WindowControlButton({
	ariaLabel,
	title = ariaLabel,
	children,
	onClick,
	variant = "default",
	pressed,
	disabled = false,
	busy = false,
}: WindowControlButtonProps) {
	const variantClass =
		variant === "danger"
			? "hover:bg-red-700 hover:text-white"
			: "hover:bg-black/10";

	return (
		<button
			type="button"
			className={`
				flex items-center justify-center min-h-0 shrink-0
				cursor-pointer overflow-hidden rounded-none text-sm leading-none
				text-inherit focus-visible:outline-2 focus-visible:-outline-offset-2
				focus-visible:outline-current aria-disabled:opacity-60
				aria-pressed:bg-black/15
				aria-pressed:text-slate-950
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
			aria-pressed={pressed}
			aria-disabled={disabled || busy || undefined}
			aria-busy={busy || undefined}
			disabled={disabled}
			title={title}
			onClick={() => {
				if (!disabled && !busy) onClick();
			}}
		>
			{children}
		</button>
	);
}

export default WindowControlButton;
