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
			console.error("Failed to update the Always on top setting:", error);
			if (request === pinRequestRef.current) {
				setPinError("Couldn't update the Always on top setting. Select Always on top to try again.");
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
