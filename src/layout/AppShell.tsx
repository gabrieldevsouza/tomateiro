import { useState, type ReactNode } from "react";
import CustomTitlebar, {
	TITLEBAR_MAXIMIZED_HEIGHT,
} from "../window/CustomTitlebar";

type AppShellProps = {
	children: ReactNode;
};

function AppShell({ children }: AppShellProps) {
	const [isMaximized, setIsMaximized] = useState(false);

	return (
		<div
			data-theme="light"
			className="
				relative
				h-screen
				w-screen
				overflow-hidden
				bg-white
			"
		>
			<CustomTitlebar
				onMaximizedChange={setIsMaximized}
			/>

			<main
				className="
					w-full
					overflow-hidden
					transition-[height,margin-top]
					duration-300
					ease-out
					motion-reduce:transition-none
				"
				style={{
					height: isMaximized
						? `calc(100% - ${TITLEBAR_MAXIMIZED_HEIGHT})`
						: "100%",
					marginTop: isMaximized
						? TITLEBAR_MAXIMIZED_HEIGHT
						: 0,
				}}
			>
				{children}
			</main>
		</div>
	);
}

export default AppShell;
