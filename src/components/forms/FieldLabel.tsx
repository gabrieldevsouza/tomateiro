import type { ComponentProps } from "react";

export type FieldLabelProps = ComponentProps<"label">;

function FieldLabel({ className = "", children, ...props }: FieldLabelProps) {
	return (
		<label
			{...props}
			className={`@container-size block h-full w-full min-h-0 min-w-0 ${className}`}
		>
			<span className="pointer-events-none flex h-full w-full select-none items-center whitespace-nowrap font-[Beiruti] text-[min(12cqw,140cqh)] leading-none font-bold text-white">
				{children}
			</span>
		</label>
	);
}

export default FieldLabel;
