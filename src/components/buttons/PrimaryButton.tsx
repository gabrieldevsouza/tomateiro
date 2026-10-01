import Button, { type ButtonProps } from "./Button";

function PrimaryButton({ className = "", ...props }: ButtonProps) {
	return (
		<Button
			{...props}
			className={`
				not-[:is(:disabled,[aria-disabled=true],.btn-disabled)]:bg-[#00CBEA]
				not-[:is(:disabled,[aria-disabled=true],.btn-disabled)]:text-black
				not-[:is(:disabled,[aria-disabled=true],.btn-disabled)]:hover:bg-[#43DCF3]
				not-[:is(:disabled,[aria-disabled=true],.btn-disabled)]:focus-visible:bg-[#43DCF3]
				not-[:is(:disabled,[aria-disabled=true],.btn-disabled)]:active:bg-[#00A5BE]
				${className}
			`}
		/>
	);
}

export default PrimaryButton;
