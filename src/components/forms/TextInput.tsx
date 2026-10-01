import type { ComponentProps } from "react";

export type TextInputProps = ComponentProps<"input"> & {
	containerClassName?: string;
};

function TextInput({ type = "text", className = "", containerClassName = "", ...props }: TextInputProps) {
	return (
		<div className={`@container-size flex h-full w-full min-h-0 min-w-0 items-center bg-[#17243F] ${containerClassName}`}>
			<input
				{...props}
				type={type}
				className={`input box-border h-full w-full min-h-0 min-w-0 select-text rounded-none bg-transparent px-[max(0px,calc(4cqw-var(--border)))] py-0 font-[Epilogue] text-[min(7cqw,34cqh)] shadow-none [--border:2px] not-focus:border-transparent focus:bg-white/10 focus:outline-none ${className}`}
			/>
		</div>
	);
}

export default TextInput;
