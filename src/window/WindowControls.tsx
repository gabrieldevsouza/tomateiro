import { getCurrentWindow } from "@tauri-apps/api/window";
import { PiCopySimple, PiMinusBold, PiSquare, PiXBold } from "react-icons/pi";
import WindowControlButton from "./WindowControlButton";

async function executeWindowAction(action: () => Promise<void>) {
	try {
		await action();
	} catch (error: unknown) {
		console.error(
			"Failed to execute window command:",
			error,
		);
	}
}

function WindowControls({ isMaximized }: { isMaximized: boolean }) {
	return (
		<div className="flex h-full items-stretch">
			<WindowControlButton
				ariaLabel="Minimize window"
				variant="default"
				onClick={() =>
					void executeWindowAction(() =>
						getCurrentWindow().minimize()
					)
				}
			>
				<PiMinusBold aria-hidden="true" className="size-3.5" />
			</WindowControlButton>

			<WindowControlButton
				ariaLabel={isMaximized ? "Restore window" : "Maximize window"}
				variant="default"
				onClick={() =>
					void executeWindowAction(() =>
						getCurrentWindow().toggleMaximize()
					)
				}
			>
				{isMaximized ? (
					<PiCopySimple aria-hidden="true" className="size-3.5" />
				) : (
					<PiSquare aria-hidden="true" className="size-3.5" />
				)}
			</WindowControlButton>

			<WindowControlButton
				ariaLabel="Close window"
				variant="danger"
				onClick={() =>
					void executeWindowAction(() =>
						getCurrentWindow().close()
					)
				}
			>
				<PiXBold aria-hidden="true" className="size-3.5" />
			</WindowControlButton>
		</div>
	);
}

export default WindowControls;
