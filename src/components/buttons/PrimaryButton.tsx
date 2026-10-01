import Button, { type ButtonProps } from "./Button";

function PrimaryButton({ className = "", ...props }: ButtonProps) {
	return (
		<Button
			{...props}
			className={`
				bg-[#00CBEA] text-black
				hover:bg-[#00B8D4] focus-visible:bg-[#00B8D4] active:bg-[#00A5BE]
				${className}
			`}
		/>
	);
}

export default PrimaryButton;
