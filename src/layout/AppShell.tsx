import { useState, type ReactNode } from "react";
import { RiGalleryView } from "react-icons/ri";
import { MdOutlineTimer } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import CustomTitlebar, {
	TITLEBAR_MAXIMIZED_HEIGHT,
	TITLEBAR_DEFAULT_HEIGHT,
} from "../window/CustomTitlebar";
import { TitlebarPortalContext } from "../window/TitlebarPortalContext";
import SidebarOption from "../features/pomodoro/components/controls/SidebarOption";

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
				<div className="drawer absolute bottom-0 left-0 z-50">
  					<input 
						id="my-drawer-1" 
						type="checkbox" 
						className="drawer-toggle"
					/>
  					<div className="
						drawer-content
					">
						{/* Page content here */}
						<label htmlFor="my-drawer-1" className="btn drawer-button">Open drawer</label>
					</div>
					<div className="drawer-side">
						<label htmlFor="my-drawer-1" aria-label="close sidebar" className="drawer-overlay"></label>
						<ul className="menu bg-base-200 min-h-full w-80 p-4">
						{/* Sidebar content here */}
						<SidebarOption label="Current Pomodoro" icon={<MdOutlineTimer />} onClick={() => alert("Current Pomodoro clicked!")}></SidebarOption>
						<SidebarOption label="Gallery" icon={<RiGalleryView />} onClick={() => alert("Gallery clicked!")}></SidebarOption>
						<SidebarOption label="Settings" icon={<IoSettingsOutline />} onClick={() => alert("Settings clicked!")}></SidebarOption>
						</ul>
  					</div>
				</div>
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
