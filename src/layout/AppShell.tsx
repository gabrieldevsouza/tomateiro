import { useEffect, useState, type ReactNode } from "react";
import CustomTitlebar, {
	TITLEBAR_MAXIMIZED_HEIGHT,
	TITLEBAR_DEFAULT_HEIGHT,
} from "../window/CustomTitlebar";
import { TitlebarPortalContext } from "../window/TitlebarPortalContext";

type AppShellProps = {
	children: ReactNode;
};

const MINIPLAYER_HEIGHT_PERCENT = 30;
const MINIPLAYER_WIDTH_PERCENT = 30;

function AppShell({ children }: AppShellProps) {
	const [isMaximized, setIsMaximized] = useState(false);
	const [titlebarContainer, setTitlebarContainer] = useState<HTMLElement | null>(null);
	const titlebarHeight = isMaximized ? TITLEBAR_MAXIMIZED_HEIGHT : TITLEBAR_DEFAULT_HEIGHT;

	const [panelLayout, setPanelLayout] = useState<
	"normal" | "height" | "width"
	>("normal");

	useEffect(() => {
	function updatePanelLayout() {
		const { height, width } = window.screen;

		const isCompactHeight =
		height > 0 &&
		(window.innerHeight / height) * 100 <= MINIPLAYER_HEIGHT_PERCENT;

		const isCompactWidth =
		width > 0 &&
		(window.innerWidth / width) * 100 <= MINIPLAYER_WIDTH_PERCENT;

		if (isCompactHeight) {
		setPanelLayout("height");
		} else if (isCompactWidth) {
		setPanelLayout("width");
		} else {
		setPanelLayout("normal");
		}
	}

	updatePanelLayout();
	window.addEventListener("resize", updatePanelLayout);

	return () => {
		window.removeEventListener("resize", updatePanelLayout);
	};
	}, []);

	return (
		<TitlebarPortalContext.Provider value={{ setContainer: setTitlebarContainer, height: titlebarHeight }}>
			<div
				data-maximized={isMaximized}
  				data-panel-layout={isMaximized ? "normal" : panelLayout}
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
