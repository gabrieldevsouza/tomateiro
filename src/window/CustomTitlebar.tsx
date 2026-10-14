import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { PiPushPin, PiPushPinFill, PiWarningCircle } from "react-icons/pi";
import WindowControlButton from "./WindowControlButton";
import WindowControls from "./WindowControls";
import WindowTitle from "./WindowTitle";
import { useTitlebarVisibility } from "./useTitlebarVisibility";
import { useWindowMaximized } from "./useWindowMaximized";
import { useWindowPin } from "./useWindowPin";

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
	const isMaximized = useWindowMaximized(onMaximizedChange);
	const { isPinned, isPinPending, pinError, updatePinnedState } = useWindowPin();
	const {
		shouldShowTitlebar,
		titlebarRef,
		interactionRegionRef,
		handlePointerInside,
		handlePointerOutside,
		reconcileVisibility,
	} = useTitlebarVisibility(isMaximized, portalContainer);
	const titlebarHeight = isMaximized ? TITLEBAR_MAXIMIZED_HEIGHT : TITLEBAR_DEFAULT_HEIGHT;

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
