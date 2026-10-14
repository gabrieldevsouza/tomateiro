import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function useWindowPin() {
	const [isPinned, setIsPinned] = useState<boolean | null>(null);
	const [isPinPending, setIsPinPending] = useState(true);
	const [pinError, setPinError] = useState<string | null>(null);
	const pinPendingRef = useRef(false);
	const pinRequestRef = useRef(0);

	const updatePinnedState = useCallback(async (toggle = false) => {
		// State alone cannot lock two actions before React commits the next render.
		if (pinPendingRef.current) return;
		const request = ++pinRequestRef.current;
		pinPendingRef.current = true;
		setIsPinPending(true);
		setPinError(null);

		try {
			const appWindow = getCurrentWindow();
			const currentPinned = await appWindow.isAlwaysOnTop();
			if (request !== pinRequestRef.current) return;
			const nextPinned = toggle ? !currentPinned : currentPinned;
			if (toggle) await appWindow.setAlwaysOnTop(nextPinned);
			if (request === pinRequestRef.current) setIsPinned(nextPinned);
		} catch (error: unknown) {
			console.error("Falha ao atualizar fixação da janela:", error);
			if (request === pinRequestRef.current) {
				setPinError("Não foi possível atualizar a fixação. Clique no pin para tentar novamente.");
			}
		} finally {
			if (request === pinRequestRef.current) {
				pinPendingRef.current = false;
				setIsPinPending(false);
			}
		}
	}, []);

	useEffect(() => {
		void updatePinnedState();
		return () => {
			// Ignore pending reads/writes after unmount, including StrictMode cleanup.
			pinRequestRef.current++;
			pinPendingRef.current = false;
		};
	}, [updatePinnedState]);

	return { isPinned, isPinPending, pinError, updatePinnedState };
}
