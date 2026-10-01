import { useContext, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TitlebarPortalContext } from "../../../../window/TitlebarPortalContext";
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
			const controls = dialog!.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"])');
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

	useLayoutEffect(() => {
		const dialog = dialogRef.current;
		const context = document.createElement("canvas").getContext("2d");
		if (!dialog || !context) return;
		const inputs = [...dialog.querySelectorAll<HTMLInputElement>('input[type="number"]')];
		let disposed = false;

		function alignNumberInputs() {
			if (disposed) return;
			for (const input of inputs) {
				const style = getComputedStyle(input);
				context!.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
				const metrics = context!.measureText(input.value || "0");
				// A diferença entre o centro dos glifos e o da fonte define o padding.
				const padding = metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent
					- metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
				if (!Number.isFinite(padding)) continue;
				const top = `${Number(Math.max(0, padding).toFixed(3))}px`;
				const bottom = `${Number(Math.max(0, -padding).toFixed(3))}px`;
				if (input.style.paddingTop !== top) input.style.paddingTop = top;
				if (input.style.paddingBottom !== bottom) input.style.paddingBottom = bottom;
			}
		}

		function handleValueChange() {
			queueMicrotask(alignNumberInputs);
		}

		const resizeObserver = new ResizeObserver(alignNumberInputs);
		inputs.forEach(input => resizeObserver.observe(input, { box: "border-box" }));
		const styleObserver = new MutationObserver(alignNumberInputs);
		styleObserver.observe(dialog, {
			attributes: true,
			attributeFilter: ["class", "style"],
			subtree: true,
		});
		dialog.addEventListener("input", handleValueChange);
		dialog.addEventListener("change", handleValueChange);
		dialog.addEventListener("focusout", handleValueChange);
		document.fonts.addEventListener("loadingdone", alignNumberInputs);
		void document.fonts.ready.then(alignNumberInputs);
		alignNumberInputs();

		return () => {
			disposed = true;
			resizeObserver.disconnect();
			styleObserver.disconnect();
			dialog.removeEventListener("input", handleValueChange);
			dialog.removeEventListener("change", handleValueChange);
			dialog.removeEventListener("focusout", handleValueChange);
			document.fonts.removeEventListener("loadingdone", alignNumberInputs);
		};
	}, []);

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
					@container-size [&>div]:@container-size
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
						flex w-full items-center leading-none
						h-full
						whitespace-nowrap
						font-[Beiruti]
						font-bold
						pointer-events-none
						text-[#00CBEA]
					"
					style={{
						fontSize: "min(14cqw,80cqh)",
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
							
								font-[Beiruti]
								font-bold
								pointer-events-none
								text-[#ffffff]
								flex h-full w-full items-center whitespace-nowrap leading-none
							"
							style={{
								fontSize: "min(12cqw,140cqh)",
							}}
						>
								Nome do Temporizador
						</div>
					</div>

					<div className="col-start-2 row-start-5 col-span-2 flex h-full w-full min-h-0 min-w-0 items-center @container-size">
					<input
						type="text"
						aria-label="Nome do Temporizador"
						placeholder="Nome aqui.."
						className="
							input
							px-[4cqw] py-0 rounded-none
							bg-[#17243F]

							min-w-0
							min-h-0
							h-full
							w-full

							font-[Epilogue]
							
						"
						style={{
								fontSize: "min(7cqw,34cqh)",
							}}
					/>
					</div>

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
								font-[Beiruti]
								font-bold
								pointer-events-none
								text-[#ffffff]
								flex h-full w-full items-center whitespace-nowrap leading-none
							"
							style={{
								fontSize: "min(12cqw,140cqh)",
							}}
						>
							Temporizador
						</div>
					</div>

					<div className="
						col-start-2
						row-start-9

						relative
						

						min-w-0
						min-h-0
						h-full
						w-full
					">
						<TimeInputModal label="Temporizador" minutes="25"/>
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
						relative
						col-start-2
						row-start-11
						min-w-0
						min-h-0
						h-full
						w-full
					">
						<div 
							className="
								font-[Beiruti]
								font-bold
								pointer-events-none
								text-[#ffffff]
								flex h-full w-full items-center whitespace-nowrap leading-none
							"
							style={{
								fontSize: "min(12cqw,140cqh)",
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
								font-[Beiruti]
								font-bold
								pointer-events-none
								text-[#ffffff]
								flex h-full w-full items-center whitespace-nowrap leading-none
							"
							style={{
								fontSize: "min(12cqw,140cqh)",
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
						min-w-0
						min-h-0
						h-full
						
					">
						<CyclesAmountInputModal></CyclesAmountInputModal>
					</div>

					<div className="
						relative
						col-start-4
						row-start-13
						min-w-0
						min-h-0
						h-full
						w-full
					">
						<TimeInputModal label="Pausa longa" minutes="15"/>
					</div>

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
								font-[Beiruti]
								font-bold
								pointer-events-none
								text-[#ffffff]
								flex h-full w-full items-center whitespace-nowrap leading-none
							"
							style={{
								fontSize: "min(12cqw,140cqh)",
							}}
						>
							Ciclos
						</div>
					</div>

					<div className="
						col-start-2
						row-start-13
						relative
						min-w-0
						min-h-0
						h-full
						w-full
					">
						<TimeInputModal label="Pausa curta" minutes="05"/>
					</div>

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
								flex h-full w-full items-center justify-center whitespace-nowrap leading-none font-[Epilogue]
								font-bold
								pointer-events-none
								text-[#000000]
							"
							style={{
								fontSize: "min(14cqw,42cqh)",
							}}
						>
							Salvar
						</div>
					</div>

					<button
					type="button"
					onClick={onClose}				
					className={`
						@container-size p-0
						focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#00CBEA]
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
							
						mr-[8%]
						justify-self-end
						min-w-0
						min-h-0
						h-full
						w-[62%]
						rounded-full
					`}>
						<div 
							className="
								flex h-full w-full items-center justify-center whitespace-nowrap leading-none font-[Epilogue]
								font-bold
								pointer-events-none
								text-[#ffffff]
							"
							style={{
								fontSize: "min(14cqw,42cqh)",
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
