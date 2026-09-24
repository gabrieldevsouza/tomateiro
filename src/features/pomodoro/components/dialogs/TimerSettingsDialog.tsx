import { useContext, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PiXBold } from "react-icons/pi";
import { TitlebarPortalContext } from "../../../../window/TitlebarPortalContext";
import TimerControlButton from "../controls/TimerControlButton";
import TimeInputModal from "./TimeInputModal";
import CyclesAmountInputModal from "./CyclesAmountInputModal";

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
					bg-[#233E63]
					h-full
					w-full
					
					grid
					grid-cols-[minmax(0,15fr)_minmax(0,164fr)_minmax(0,82fr)_minmax(0,164fr)_minmax(0,15fr)]
					grid-rows-[minmax(0,15fr)_minmax(0,52fr)_minmax(0,10fr)_minmax(0,10fr)_minmax(0,44fr)_minmax(0,22fr)_minmax(0,10fr)_minmax(0,10fr)_minmax(0,52fr)_minmax(0,22fr)_minmax(0,10fr)_minmax(0,10fr)_minmax(0,52fr)_minmax(0,30fr)_minmax(0,40fr)_minmax(0,15fr)]
				">
					<div className="
						row-start-2
						col-start-2
						col-span-2
						min-w-0
						min-h-0
						h-full
						w-full
					">
						<div className="
						inset-0
						h-full
						whitespace-nowrap
						font-[Epilogue]
						font-bold
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
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-2
						row-start-3
					
						min-w-0
						min-h-0
						h-full
						w-full
					">
						<div 
							className="
							
								font-[Epilogue]
								font-bold
								pointer-events-none
								text-[#ffffff]
								leading-none
							"
							style={{
								fontSize: "min(2cqw,2cqh)",
								transform: "translateY(1px)"
							}}
						>
								Nome do Temporizador
						</div>
					</div>

					<input 
						type="text"
						placeholder="Nome aqui.."
						className="
							input
							col-start-2
							row-start-5
							col-span-2
							bg-[#17243F]

							min-w-0
							min-h-0
							h-full
							w-full

							font-[Epilogue]
							
						"
						style={{
								fontSize: "min(2cqw,2cqh)",
								transform: "translateY(1px)"
							}}
					/>
						
						

					<div className="
						col-start-2
						row-start-7
						min-w-0
						min-h-0
						h-full
						w-full
					">
						<div 
							className="
								font-[Epilogue]
								font-bold
								pointer-events-none
								text-[#ffffff]
								leading-none
							"
							style={{
								fontSize: "min(2cqw,2cqh)",
								transform: "translateY(1px)"
							}}
						>
							Temporizador
						</div>
					</div>

					<div className="
						col-start-2
						row-start-9
						bg-purple-400

						relative
						

						min-w-0
						min-h-0
						h-full
						w-full
					">
						<TimeInputModal></TimeInputModal>
					</div>

					<div className="
						col-start-2
						row-start-10
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-2
						row-start-11
						min-w-0
						min-h-0
						h-full
						w-full
					">
						<div 
							className="
								font-[Epilogue]
								font-bold
								pointer-events-none
								text-[#ffffff]
								leading-none
							"
							style={{
								fontSize: "min(2cqw,2cqh)",
								transform: "translateY(1px)"
							}}
						>
							Pausa Curta
						</div>
					</div>

					<div className="
						col-start-4
						row-start-11
						min-w-0
						min-h-0
						h-full
						w-full
					">
						<div 
							className="
								font-[Epilogue]
								font-bold
								pointer-events-none
								text-[#ffffff]
								leading-none
							"
							style={{
								fontSize: "min(2cqw,2cqh)",
								transform: "translateY(1px)"
							}}
						>
							Pausa Longa
						</div>
					</div>



					<div className="
						col-start-4
						row-start-9
						w-[40%]
						relative
						bg-purple-600
						min-w-0
						min-h-0
						h-full
						
					">
						<CyclesAmountInputModal></CyclesAmountInputModal>
					</div>

					<div className="
						col-start-4
						row-start-13
						bg-green-300
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<div className="
						col-start-4
						row-start-7
						min-w-0
						min-h-0
						h-full
						w-full
					">
						<div 
							className="
								font-[Epilogue]
								font-bold
								pointer-events-none
								text-[#ffffff]
								leading-none
							"
							style={{
								fontSize: "min(2cqw,2cqh)",
								transform: "translateY(1px)"
							}}
						>
							Ciclos
						</div>
					</div>

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
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					
					<div className="
						col-start-4
						row-start-15
						bg-[#00CBEA]
						flex
						justify-center
						items-center
						min-w-0
						min-h-0
						h-full
						w-full
						rounded-full
					">
						<div 
							className="
								font-[Epilogue]
								font-bold
								pointer-events-none
								text-[#000000]
							"
							style={{
								fontSize: "min(2cqw,2cqh)",
								transform: "translateY(1px)"
							}}
						>
							Salvar
						</div>
					</div>

					<button
					type="button"
					onClick={onClose}				
					className={`
						btn
						btn-ghost
						outline-none
						shadow-none
						hover:bg-[#5F77B8]
						active:bg-[#1D2230]
						border-0


						col-start-2
						col-span-2
						row-start-15
						bg-[#374468]
						flex
						justify-center
						items-center
							
						mr-5
						justify-self-end
						min-w-0
						min-h-0
						h-full
						w-[62%]
						rounded-full
					`}>
						<div 
							className="
								font-[Epilogue]
								font-bold
								pointer-events-none
								text-[#ffffff]
							"
							style={{
								fontSize: "min(2cqw,2cqh)",
								transform: "translateY(1px)"
							}}
						>
							Cancelar
						</div>
					</button>
				</div>

				
				
				
			</div>
			<button type="button" tabIndex={-1} className="modal-backdrop absolute inset-0 col-auto row-auto" aria-label="Fechar edição" onClick={onClose} />
		</dialog>,
		document.body,
	);
}

export default TimerSettingsDialog;
