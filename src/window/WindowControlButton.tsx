import type { ReactNode } from "react";

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
				min-w-0
				shrink-0
				overflow-hidden
				rounded-none
				leading-none
				${variantClass}
			`}
			style={{
				height: "100%",
				width: "auto",
				aspectRatio: "1 / 1",
				padding: 0,
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