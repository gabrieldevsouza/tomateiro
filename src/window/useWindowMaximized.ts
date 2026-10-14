import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function useWindowMaximized(onMaximizedChange?: (isMaximized: boolean) => void) {
	const [isMaximized, setIsMaximized] = useState(false);

	useEffect(() => {
		const appWindow = getCurrentWindow();
		let isDisposed = false;
		let stopListening: (() => void) | undefined;
		let latestRequest = 0;

		async function syncMaximizedState() {
			const request = ++latestRequest;
			try {
				const maximized = await appWindow.isMaximized();
				if (!isDisposed && request === latestRequest) {
					setIsMaximized(maximized);
					onMaximizedChange?.(maximized);
				}
			} catch (error: unknown) {
				console.error("Falha ao consultar estado maximizado:", error);
			}
		}
		void syncMaximizedState();
		void appWindow.onResized(() => {
			void syncMaximizedState();
		}).then((unlisten) => {
			if (isDisposed) unlisten();
			else stopListening = unlisten;
		}).catch((error: unknown) => console.error("Falha ao observar redimensionamento:", error));

		return () => {
			isDisposed = true;
			stopListening?.();
		};
	}, [onMaximizedChange]);

	return isMaximized;
}
