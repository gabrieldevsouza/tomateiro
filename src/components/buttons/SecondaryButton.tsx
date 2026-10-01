import Button, { type ButtonProps } from "./Button";

function SecondaryButton({ className = "", ...props }: ButtonProps) {
	return (
		<Button
			{...props}
			className={`
				not-[:is(:disabled,[aria-disabled=true],.btn-disabled)]:bg-[#535A6F]
				not-[:is(:disabled,[aria-disabled=true],.btn-disabled)]:text-white
				not-[:is(:disabled,[aria-disabled=true],.btn-disabled)]:hover:bg-[#5F667D]
				not-[:is(:disabled,[aria-disabled=true],.btn-disabled)]:focus-visible:bg-[#5F667D]
				not-[:is(:disabled,[aria-disabled=true],.btn-disabled)]:active:bg-[#4A5268]
				${className}
			`}
		/>
	);
}

export default SecondaryButton;
