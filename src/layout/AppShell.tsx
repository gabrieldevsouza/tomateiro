import { useState, type ReactNode } from "react";
import CustomTitlebar, {
	TITLEBAR_MAXIMIZED_HEIGHT,
	TITLEBAR_DEFAULT_HEIGHT,
} from "../window/CustomTitlebar";
import { TitlebarPortalContext } from "../window/TitlebarPortalContext";

type AppShellProps = {
	children: ReactNode;
};

function AppShell({ children }: AppShellProps) {
	const [isMaximized, setIsMaximized] = useState(false);
	const [titlebarContainer, setTitlebarContainer] = useState<HTMLElement | null>(null);
	const titlebarHeight = isMaximized ? TITLEBAR_MAXIMIZED_HEIGHT : TITLEBAR_DEFAULT_HEIGHT;

	return (
		<TitlebarPortalContext.Provider value={{ setContainer: setTitlebarContainer, height: titlebarHeight }}>
			<div
				className="
					relative
					h-screen
					w-screen
					overflow-hidden
				"
			>
				<CustomTitlebar
					onMaximizedChange={setIsMaximized}
					portalContainer={titlebarContainer}
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
		</TitlebarPortalContext.Provider>
	);
}

export default AppShell;
