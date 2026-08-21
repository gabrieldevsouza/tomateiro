import { useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import WindowControls from "./WindowControls";
import WindowTitle from "./WindowTitle";

const appWindow = getCurrentWindow();

const INITIAL_HIDE_DELAY_MS = 1200;
const LEAVE_HIDE_DELAY_MS = 400;

const TITLEBAR_MIN_HEIGHT = "0.8rem";
const TITLEBAR_PREFERRED_HEIGHT = "10dvh";
const TITLEBAR_MAX_HEIGHT = "1.8rem";
const TITLEBAR_MAXIMIZED_HEIGHT = "2.5rem";

const TITLEBAR_DEFAULT_HEIGHT =
	`clamp(${TITLEBAR_MIN_HEIGHT}, ${TITLEBAR_PREFERRED_HEIGHT}, ${TITLEBAR_MAX_HEIGHT})`;

const REVEAL_ZONE_HEIGHT_PERCENT = 15;
const REVEAL_ZONE_MIN_HEIGHT = "0.375rem";
const REVEAL_ZONE_MAX_HEIGHT = "0.625rem";

function CustomTitlebar() {
	const [isVisible, setIsVisible] = useState(true);
	const [isMaximized, setIsMaximized] = useState(false);

	const hideTimeoutRef = useRef<number | null>(null);

	function clearScheduledHide() {
		if (hideTimeoutRef.current === null) {
			return;
		}

		window.clearTimeout(hideTimeoutRef.current);
		hideTimeoutRef.current = null;
	}

	function showTitlebar() {
		clearScheduledHide();
		setIsVisible(true);
	}

	function scheduleHide(delay: number) {
		if (isMaximized) {
			clearScheduledHide();
			setIsVisible(true);
			return;
		}

		clearScheduledHide();

		hideTimeoutRef.current = window.setTimeout(() => {
			setIsVisible(false);
			hideTimeoutRef.current = null;
		}, delay);
	}

	useEffect(() => {
		if (hideTimeoutRef.current !== null) {
			window.clearTimeout(hideTimeoutRef.current);
			hideTimeoutRef.current = null;
		}

		setIsVisible(true);

		if (!isMaximized) {
			hideTimeoutRef.current = window.setTimeout(() => {
				setIsVisible(false);
				hideTimeoutRef.current = null;
			}, INITIAL_HIDE_DELAY_MS);
		}

		return () => {
			if (hideTimeoutRef.current !== null) {
				window.clearTimeout(hideTimeoutRef.current);
				hideTimeoutRef.current = null;
			}
		};
	}, [isMaximized]);

	useEffect(() => {
		let isDisposed = false;
		let stopListening: (() => void) | undefined;

		async function syncMaximizedState() {
			try {
				const maximized = await appWindow.isMaximized();

				if (!isDisposed) {
					setIsMaximized(maximized);
				}
			} catch (error: unknown) {
				console.error(
					"Falha ao consultar estado maximizado:",
					error,
				);
			}
		}

		void syncMaximizedState();

		void appWindow
			.onResized(() => {
				void syncMaximizedState();
			})
			.then((unlisten) => {
				if (isDisposed) {
					unlisten();
					return;
				}

				stopListening = unlisten;
			})
			.catch((error: unknown) => {
				console.error(
					"Falha ao observar redimensionamento:",
					error,
				);
			});

		return () => {
			isDisposed = true;
			stopListening?.();
		};
	}, []);

	const titlebarHeight = isMaximized
		? TITLEBAR_MAXIMIZED_HEIGHT
		: TITLEBAR_DEFAULT_HEIGHT;

	const shouldShowTitlebar = isMaximized || isVisible;

	return (
		<div
			className="
				pointer-events-none
				absolute
				inset-x-0
				top-0
				z-50
				transition-[height]
				duration-300
				ease-out
				motion-reduce:transition-none
			"
			style={{
				height: titlebarHeight,
			}}
		>
			<div
				aria-hidden="true"
				className="
					pointer-events-auto
					absolute
					inset-x-0
					top-0
					z-10
				"
				style={{
					height: `${REVEAL_ZONE_HEIGHT_PERCENT}%`,
					minHeight: REVEAL_ZONE_MIN_HEIGHT,
					maxHeight: REVEAL_ZONE_MAX_HEIGHT,
				}}
				onPointerMove={showTitlebar}
			/>

			<header
				className={`
					absolute
					inset-x-0
					top-0
					z-20
					flex
					h-full
					items-center
					bg-white
					select-none
					transition-transform
					duration-300
					motion-reduce:transition-none
					${
						shouldShowTitlebar
							? "translate-y-0 pointer-events-auto ease-out"
							: "-translate-y-full pointer-events-none ease-in"
					}
				`}
				onPointerEnter={showTitlebar}
				onPointerLeave={() =>
					scheduleHide(LEAVE_HIDE_DELAY_MS)
				}
				onFocusCapture={showTitlebar}
				onBlurCapture={() =>
					scheduleHide(LEAVE_HIDE_DELAY_MS)
				}
			>
				<WindowTitle title="Tomateiro" />
				<WindowControls />
			</header>
		</div>
	);
}

export default CustomTitlebar;