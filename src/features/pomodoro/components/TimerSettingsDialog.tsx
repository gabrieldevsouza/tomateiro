import { useContext, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PiXBold } from "react-icons/pi";
import { TitlebarPortalContext } from "../../../window/TitlebarPortalContext";
import TimerControlButton from "./controls/TimerControlButton";

type TimerSettingsDialogProps = {
	onClose: () => void;
};

function TimerSettingsDialog({ onClose }: TimerSettingsDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titlebar = useContext(TitlebarPortalContext);
	const setTitlebarContainer = titlebar?.setContainer;
	const titlebarHeight = titlebar?.height ?? "0px";

	useLayoutEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		dialog.showModal();
		setTitlebarContainer?.(dialog);
		// Include the portaled window controls in the modal's keyboard navigation.
		function handleDialogKeyDown(event: KeyboardEvent) {
			if (event.key !== "Tab") return;
			const controls = dialog!.querySelectorAll<HTMLButtonElement>('button:not([disabled]):not([tabindex="-1"])');
			const first = controls[0];
			const last = controls[controls.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last?.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first?.focus();
			}
		}
		dialog.addEventListener("keydown", handleDialogKeyDown);
		return () => {
			dialog.removeEventListener("keydown", handleDialogKeyDown);
			setTitlebarContainer?.(null);
			dialog.close();
		};
	}, [setTitlebarContainer]);

	return createPortal(
		<dialog
			ref={dialogRef}
			className="modal"
			style={{ paddingTop: `calc(${titlebarHeight} + 0.5rem)`, paddingBottom: "0.5rem" }}
			aria-label="Editar Pomodoro"
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
		>
			<div
				className="modal-box relative h-40 w-[calc(100%-2rem)] max-w-lg border border-[#374468] bg-[#212940] p-0"
				style={{ maxHeight: `calc(100dvh - ${titlebarHeight} - 1rem)` }}
			>
				<div className="absolute right-3 top-3 size-8">
					<TimerControlButton
						ariaLabel="Fechar edição"
						onClick={onClose}
						bgColor="bg-transparent"
						icon={<PiXBold aria-hidden="true" className="size-1/2" />}
					/>
				</div>
			</div>
			<button type="button" tabIndex={-1} className="modal-backdrop" aria-label="Fechar edição" onClick={onClose} />
		</dialog>,
		document.body,
	);
}

export default TimerSettingsDialog;
