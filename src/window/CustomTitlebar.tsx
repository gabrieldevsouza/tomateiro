import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PiPushPin, PiPushPinFill, PiWarningCircle } from "react-icons/pi";
import WindowControlButton from "./WindowControlButton";
import WindowControls from "./WindowControls";
import WindowTitle from "./WindowTitle";

const appWindow = getCurrentWindow();
const INITIAL_HIDE_DELAY_MS = 1200;
const LEAVE_HIDE_DELAY_MS = 800;

export const TITLEBAR_DEFAULT_HEIGHT = "clamp(1.5rem, 10dvh, 1.8rem)";
export const TITLEBAR_MAXIMIZED_HEIGHT = "2.5rem";

const REVEAL_ZONE_HEIGHT_PERCENT = 15;
const REVEAL_ZONE_MIN_HEIGHT = "0.375rem";
const REVEAL_ZONE_MAX_HEIGHT = "0.625rem";

type CustomTitlebarProps = {
	onMaximizedChange?: (isMaximized: boolean) => void;
	portalContainer?: HTMLElement | null;
};

function CustomTitlebar({ onMaximizedChange, portalContainer = null }: CustomTitlebarProps) {
	const [isVisible, setIsVisible] = useState(true);
	const [isMaximized, setIsMaximized] = useState(false);
	const [isPinned, setIsPinned] = useState<boolean | null>(null);
	const [isPinPending, setIsPinPending] = useState(true);
	const [pinError, setPinError] = useState<string | null>(null);

	const hideTimeoutRef = useRef<number | null>(null);
	const pinPendingRef = useRef(false);
	const pinRequestRef = useRef(0);
	const titlebarRef = useRef<HTMLElement | null>(null);
	const interactionRegionRef = useRef<HTMLDivElement | null>(null);
	const previousPortalRef = useRef(portalContainer);
	const interactionRef = useRef({
		pointerInside: false,
		windowFocused: document.hasFocus(),
		maximized: false,
		modalOpen: false,
	});

	function clearScheduledHide() {
		if (hideTimeoutRef.current !== null) {
			window.clearTimeout(hideTimeoutRef.current);
			hideTimeoutRef.current = null;
		}
	}

	function shouldKeepVisible() {
		const interaction = interactionRef.current;
		const activeElement = document.activeElement;
		return interaction.maximized || interaction.modalOpen ||
			interaction.pointerInside || (
				interaction.windowFocused && document.hasFocus() &&
				titlebarRef.current?.contains(activeElement) &&
				activeElement?.matches(":focus-visible")
			);
	}

	function reconcileVisibility(delay = LEAVE_HIDE_DELAY_MS) {
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
	}

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
	}, [isMaximized, portalContainer]);

	useEffect(() => {
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
	}, []);

	useEffect(() => {
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

	useEffect(() => {
		void updatePinnedState();
		return () => {
			pinRequestRef.current++;
			pinPendingRef.current = false;
		};
	}, []);

	async function updatePinnedState(toggle = false) {
		if (pinPendingRef.current) return;
		const request = ++pinRequestRef.current;
		pinPendingRef.current = true;
		setIsPinPending(true);
		setPinError(null);

		try {
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
	}

	const titlebarHeight = isMaximized ? TITLEBAR_MAXIMIZED_HEIGHT : TITLEBAR_DEFAULT_HEIGHT;
	const shouldShowTitlebar = isMaximized || portalContainer !== null || isVisible;

	const titlebar = (
		<div
			ref={interactionRegionRef}
			onPointerEnter={handlePointerInside}
			onPointerMove={handlePointerInside}
			onPointerLeave={handlePointerOutside}
			onPointerCancel={handlePointerOutside}
			className="pointer-events-none absolute inset-x-0 top-0 z-50 transition-[height] duration-300 ease-out motion-reduce:transition-none"
			style={{
				height: titlebarHeight,
				"--titlebar-height": titlebarHeight,
				"--window-control-width": "clamp(1.75rem, 7dvw, 2.5rem)",
				"--titlebar-side-width": "calc(3 * var(--window-control-width))",
			} as CSSProperties}
		>
			<div
				aria-hidden="true"
				className="pointer-events-auto absolute inset-x-0 top-0 z-10"
				style={{
					height: `${REVEAL_ZONE_HEIGHT_PERCENT}%`,
					minHeight: REVEAL_ZONE_MIN_HEIGHT,
					maxHeight: REVEAL_ZONE_MAX_HEIGHT,
				}}
			/>
			<header
				ref={titlebarRef}
				data-tauri-drag-region
				className={`
					absolute inset-x-0 top-0 z-20 grid h-full items-center
					bg-blue-300 text-slate-950 select-none
					transition-transform duration-300 motion-reduce:transition-none
					${shouldShowTitlebar
						? "translate-y-0 pointer-events-auto ease-out"
						: "-translate-y-full pointer-events-none ease-in"}
				`}
				style={{ gridTemplateColumns: "var(--titlebar-side-width) minmax(0, 1fr) var(--titlebar-side-width)" }}
				onFocusCapture={() => reconcileVisibility()}
				onBlurCapture={() => reconcileVisibility()}
				onKeyDownCapture={() => reconcileVisibility()}
			>
				<div data-tauri-drag-region className="flex h-full items-stretch">
					<WindowControlButton
						ariaLabel={pinError ? "Tentar novamente a fixação" : "Manter janela sempre no topo"}
						title={pinError ?? (isPinPending ? "Consultando fixação…" : isPinned ? "Desafixar do topo" : "Fixar no topo")}
						pressed={isPinned ?? undefined}
						busy={isPinPending}
						onClick={() => { void updatePinnedState(isPinned !== null); }}
					>
						{pinError ? (
							<PiWarningCircle aria-hidden="true" className="size-4" />
						) : isPinned ? (
							<PiPushPinFill aria-hidden="true" className="size-4" />
						) : (
							<PiPushPin aria-hidden="true" className="size-4" />
						)}
					</WindowControlButton>
				</div>
				<WindowTitle title="Tomateiro" />
				<div className="h-full justify-self-end">
					<WindowControls isMaximized={isMaximized} />
				</div>
				<span className="sr-only" role="status">{pinError}</span>
			</header>
		</div>
	);
	return portalContainer ? createPortal(titlebar, portalContainer) : titlebar;
}

export default CustomTitlebar;
