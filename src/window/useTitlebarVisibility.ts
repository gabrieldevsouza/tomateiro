import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const INITIAL_HIDE_DELAY_MS = 1200;
const LEAVE_HIDE_DELAY_MS = 800;

export function useTitlebarVisibility(isMaximized: boolean, portalContainer: HTMLElement | null) {
	const [isVisible, setIsVisible] = useState(true);
	const hideTimeoutRef = useRef<number | null>(null);
	const titlebarRef = useRef<HTMLElement | null>(null);
	const interactionRegionRef = useRef<HTMLDivElement | null>(null);
	const previousPortalRef = useRef(portalContainer);
	const interactionRef = useRef({
		pointerInside: false,
		windowFocused: typeof document !== "undefined" && document.hasFocus(),
		maximized: false,
		modalOpen: false,
	});

	const clearScheduledHide = useCallback(() => {
		if (hideTimeoutRef.current !== null) {
			window.clearTimeout(hideTimeoutRef.current);
			hideTimeoutRef.current = null;
		}
	}, []);

	const shouldKeepVisible = useCallback(() => {
		const interaction = interactionRef.current;
		const activeElement = document.activeElement;
		return interaction.maximized || interaction.modalOpen ||
			interaction.pointerInside || (
				interaction.windowFocused && document.hasFocus() &&
				titlebarRef.current?.contains(activeElement) &&
				activeElement?.matches(":focus-visible")
			);
	}, []);

	const reconcileVisibility = useCallback((delay = LEAVE_HIDE_DELAY_MS) => {
		clearScheduledHide();
		if (shouldKeepVisible()) {
			setIsVisible(true);
			return;
		}
		hideTimeoutRef.current = window.setTimeout(() => {
			hideTimeoutRef.current = null;
			// Recheck current interaction; the pointer/focus may have changed.
			if (!shouldKeepVisible()) setIsVisible(false);
		}, delay);
	}, [clearScheduledHide, shouldKeepVisible]);

	function handlePointerInside() {
		interactionRef.current.pointerInside = true;
		reconcileVisibility();
	}

	function handlePointerOutside() {
		interactionRef.current.pointerInside = false;
		reconcileVisibility();
	}

	useEffect(() => {
		interactionRef.current.maximized = isMaximized;
		interactionRef.current.modalOpen = portalContainer !== null;
		// Portaling replaces the DOM nodes; discard hover from the old container.
		if (previousPortalRef.current !== portalContainer) {
			interactionRef.current.pointerInside = false;
			previousPortalRef.current = portalContainer;
		}
		setIsVisible(true);
		reconcileVisibility(INITIAL_HIDE_DELAY_MS);
		return clearScheduledHide;
	}, [isMaximized, portalContainer, reconcileVisibility, clearScheduledHide]);

	useEffect(() => {
		const appWindow = getCurrentWindow();
		let isDisposed = false;
		let stopListening: (() => void) | undefined;
		let focusRevision = 0;

		function updateFocus(focused: boolean, delay = LEAVE_HIDE_DELAY_MS) {
			focusRevision++;
			interactionRef.current.windowFocused = focused;
			// WebView focus can briefly leave and return without a pointer event.
			interactionRef.current.pointerInside = focused &&
				(interactionRegionRef.current?.matches(":hover") ?? false);
			reconcileVisibility(delay);
		}
		const handleFocus = () => updateFocus(true);
		const handleBlur = () => updateFocus(false);
		const handleVisibility = () => updateFocus(!document.hidden && document.hasFocus());
		window.addEventListener("focus", handleFocus);
		window.addEventListener("blur", handleBlur);
		document.addEventListener("visibilitychange", handleVisibility);

		const revision = focusRevision;
		void appWindow.isFocused().then((focused) => {
			if (!isDisposed && revision === focusRevision) updateFocus(focused, INITIAL_HIDE_DELAY_MS);
		}).catch((error: unknown) => console.error("Falha ao consultar foco da janela:", error));
		void appWindow.onFocusChanged(({ payload }) => {
			if (!isDisposed) updateFocus(payload);
		}).then((unlisten) => {
			if (isDisposed) unlisten();
			else stopListening = unlisten;
		}).catch((error: unknown) => console.error("Falha ao observar foco da janela:", error));

		return () => {
			isDisposed = true;
			stopListening?.();
			window.removeEventListener("focus", handleFocus);
			window.removeEventListener("blur", handleBlur);
			document.removeEventListener("visibilitychange", handleVisibility);
			clearScheduledHide();
		};
	}, [reconcileVisibility, clearScheduledHide]);

	return {
		shouldShowTitlebar: isMaximized || portalContainer !== null || isVisible,
		titlebarRef,
		interactionRegionRef,
		handlePointerInside,
		handlePointerOutside,
		reconcileVisibility,
	};
}
