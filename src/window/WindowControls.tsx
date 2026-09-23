import { getCurrentWindow } from "@tauri-apps/api/window";
import { PiCopySimple, PiMinusBold, PiSquare, PiXBold } from "react-icons/pi";
import WindowControlButton from "./WindowControlButton";

const appWindow = getCurrentWindow();

function executeWindowAction(action: () => Promise<void>) {
	void action().catch((error: unknown) => {
		console.error(
			"Falha ao executar comando de janela:",
			error,
		);
	});
}

function WindowControls({ isMaximized }: { isMaximized: boolean }) {
	return (
		<div className="flex h-full items-stretch">
			<WindowControlButton
				ariaLabel="Minimizar janela"
				variant="default"
				onClick={() =>
					executeWindowAction(() =>
						appWindow.minimize()
					)
				}
			>
				<PiMinusBold aria-hidden="true" className="size-3.5" />
			</WindowControlButton>

			<WindowControlButton
				ariaLabel={isMaximized ? "Restaurar janela" : "Maximizar janela"}
				variant="default"
				onClick={() =>
					executeWindowAction(() =>
						appWindow.toggleMaximize()
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
				ariaLabel="Fechar janela"
				variant="danger"
				onClick={() =>
					executeWindowAction(() =>
						appWindow.close()
					)
				}
			>
				<PiXBold aria-hidden="true" className="size-3.5" />
			</WindowControlButton>
		</div>
	);
}

export default WindowControls;
