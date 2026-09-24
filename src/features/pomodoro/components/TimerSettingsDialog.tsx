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
			className="modal @container-size"
			style={{ paddingTop: titlebarHeight }}
			aria-label="Editar Pomodoro"
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
		>
			{/* 70cqmin = 70% do menor lado da área disponível abaixo da titlebar. */}
			<div className="modal-box relative aspect-square h-auto max-h-none w-[70cqmin] max-w-none border border-[#374468] bg-[#212940] p-0">
				<div className="
					bg-pink-500
					h-full
					w-full
					
					grid
					grid-cols-[minmax(0,15fr)_minmax(0,164fr)_minmax(0,82fr)_minmax(0,164fr)_minmax(0,15fr)]
					grid-rows-[minmax(0,15fr)_minmax(0,52fr)_minmax(0,10fr)_minmax(0,10fr)_minmax(0,44fr)_minmax(0,22fr)_minmax(0,10fr)_minmax(0,10fr)_minmax(0,52fr)_minmax(0,22fr)_minmax(0,10fr)_minmax(0,10fr)_minmax(0,52fr)_minmax(0,30fr)_minmax(0,40fr)_minmax(0,15fr)]
				">

					<div className="
						row-start-1
						col-start-2
						bg-pink-100
						min-w-0
						min-h-0
						h-full
						w-full
					"/>
					<div className="
						row-start-2
						col-start-2
						bg-yellow-600
						min-w-0
						min-h-0
						h-full
						w-full
					">
						<div className="
						inset-0
						flex
						items-center
						justify-center
						font-[Epilogue]
						font-semibold
						pointer-events-none
						text-[#00CBEA]
					"
					style={{
						fontSize: "min(6cqw,4cqh)",
					}}
					>
							Editar Tomateiro
						</div>
						
					</div>
					<div className="
						row-start-3
						col-start-2
						bg-pink-600
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-2
						row-start-4
						bg-pink-800
						min-w-0
						min-h-0
						h-full
						w-full
					">
					 Nome do Temporizador
					</div>

					<div className="
						col-start-2
						row-start-5
						bg-pink-300
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-2
						row-start-6
						bg-purple-600
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-2
						row-start-7
						bg-purple-400
						min-w-0
						min-h-0
						h-full
						w-full
					">
					 Temporizador
					</div>

					<div className="
						col-start-2
						row-start-8
						bg-purple-600
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-2
						row-start-9
						bg-purple-400
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-2
						row-start-10
						bg-yellow-600
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-4
						row-start-11
						bg-green-400
						min-w-0
						min-h-0
						h-full
						w-full
					">
					 Pausa Longa
					</div>

					<div className="
						col-start-4
						row-start-9
						bg-purple-600
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-2
						row-start-3
						bg-blue-600
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-4
						row-start-7
						bg-red-600
						min-w-0
						min-h-0
						h-full
						w-full
					">
						Ciclos
					</div>

					<div className="
						col-start-2
						row-start-11
						bg-red-300
						min-w-0
						min-h-0
						h-full
						w-full
					">
						Pausa Curta
					</div>

					<div className="
						col-start-2
						row-start-12
						bg-red-800
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-2
						row-start-13
						bg-red-300
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-2
						row-start-14
						bg-yellow-400
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-2
						row-start-15
						bg-blue-600
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-2
						row-start-16
						bg-blue-400
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-4
						row-start-15
						bg-blue-400
						min-w-0
						min-h-0
						h-full
						w-full
					">
						Salvar
					</div>

				</div>

				
				
				<div className="absolute right-3 top-3 size-8">
					<TimerControlButton
						ariaLabel="Fechar edição"
						onClick={onClose}
						bgColor="bg-transparent"
						icon={<PiXBold aria-hidden="true" className="size-1/2" />}
					/>
				</div>
			</div>
			<button type="button" tabIndex={-1} className="modal-backdrop absolute inset-0 col-auto row-auto" aria-label="Fechar edição" onClick={onClose} />
		</dialog>,
		document.body,
	);
}

export default TimerSettingsDialog;
