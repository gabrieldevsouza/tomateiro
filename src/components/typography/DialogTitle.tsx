import type { ComponentProps } from "react";

export type DialogTitleProps = ComponentProps<"h2">;

function DialogTitle({ className = "", children, ...props }: DialogTitleProps) {
	return (
		<h2
			{...props}
			className={`@container-size m-0 h-full w-full min-h-0 min-w-0 ${className}`}
		>
			<span className="pointer-events-none flex h-full w-full select-none items-center whitespace-nowrap font-[Beiruti] text-[min(14cqw,80cqh)] leading-none font-bold text-[#00CBEA]">
				{children}
			</span>
		</h2>
	);
}

export default DialogTitle;
