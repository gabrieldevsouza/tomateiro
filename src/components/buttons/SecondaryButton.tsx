import Button, { type ButtonProps } from "./Button";

function SecondaryButton({ className = "", ...props }: ButtonProps) {
	return (
		<Button
			{...props}
			className={`
				bg-[#535A6F] text-white
				hover:bg-[#5F667D] focus-visible:bg-[#5F667D] active:bg-[#4A5268]
				${className}
			`}
		/>
	);
}

export default SecondaryButton;
