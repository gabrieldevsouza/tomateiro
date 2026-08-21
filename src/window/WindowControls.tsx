import { getCurrentWindow } from "@tauri-apps/api/window";
import WindowControlButton from "./WindowControlButton";

const appWindow = getCurrentWindow();

function executeWindowAction(action: () => Promise<void>) {
	void action().catch((error: unknown) => {
		console.error("Falha ao executar comando de janela:", error);
	});
}

function WindowControls() {
	return (
		<div className="flex h-full items-center">
			<WindowControlButton
				title="Minimize"
				ariaLabel="Minimizes the window."
				variant="default"
				onClick={() => executeWindowAction(() => appWindow.minimize())}
			>
				<span aria-hidden="true">−</span>
			</WindowControlButton>

			<WindowControlButton
				title="Restore"
				ariaLabel="Maximizes or restores the window."
				variant="default"
				onClick={() => executeWindowAction(() => appWindow.toggleMaximize())}
			>
				<span aria-hidden="true">□</span>
			</WindowControlButton>

			<WindowControlButton
				title="Close"
				ariaLabel="Closes the window."
				variant="danger"
				onClick={() => executeWindowAction(() => appWindow.close())}
			>
				<span aria-hidden="true">×</span>
			</WindowControlButton>
		</div>
	);
}

export default WindowControls;