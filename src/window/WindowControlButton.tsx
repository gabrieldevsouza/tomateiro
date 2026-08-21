import { ReactNode } from "react";

type WindowControlButtonProps = {
	ariaLabel: string;
	title: string;
	children: ReactNode;
	onClick: () => void;
	variant?: "default" | "danger"
};

function WindowControlButton({
	ariaLabel,
	title = ariaLabel,
	children,
	onClick,
	variant = "danger",
}: WindowControlButtonProps){
	const variantClass =
		variant === "danger"
			? "hover:bg-error hover:text-error-content"
			: "";

	return(
		<button
			type="button"
			className={`
				btn
				btn-ghost
				btn-sm
				btn-square
				rounded-none
				${variantClass}
			`}
			aria-label={ariaLabel}
			title={title}
			onClick={onClick}
		>
			{children}
		</button>
	)
}

export default WindowControlButton;