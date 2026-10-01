import type { ComponentProps } from "react";

export type ButtonProps = ComponentProps<"button">;

function Button({ type = "button", className = "", children, ...props }: ButtonProps) {
	return (
		<button
			{...props}
			type={type}
			className={`
				btn btn-ghost @container-size
				min-h-0 min-w-0 select-none rounded-full border-0 p-0
				font-[Inter] font-bold shadow-none outline-none
				${className}
			`}
		>
			<span className="flex h-full w-full select-none items-center justify-center whitespace-nowrap text-[min(14cqw,42cqh)] leading-none">
				{children}
			</span>
		</button>
	);
}

export default Button;
