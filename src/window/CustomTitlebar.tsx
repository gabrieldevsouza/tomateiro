import WindowControls from "./WindowControls";
import WindowTitle from "./WindowTitle";

function CustomTitlebar() {
	return (
		<header className="
			flex
			h-10
			w-full
			shrink-0
			items-center
			border-b
			border-neutral-200
			bg-white
			select-none
		">
			<WindowTitle title="Tomateiro" />
			<WindowControls />
		</header>
	);
}

export default CustomTitlebar;