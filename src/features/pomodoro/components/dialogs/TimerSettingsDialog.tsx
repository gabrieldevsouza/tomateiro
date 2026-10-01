import { type ClipboardEvent, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PrimaryButton from "../../../../components/buttons/PrimaryButton";
import SecondaryButton from "../../../../components/buttons/SecondaryButton";
import FieldLabel from "../../../../components/forms/FieldLabel";
import TextInput from "../../../../components/forms/TextInput";
import DialogTitle from "../../../../components/typography/DialogTitle";
import { TitlebarPortalContext } from "../../../../window/TitlebarPortalContext";
import TimeInputModal from "./TimeInputModal";
import CyclesAmountInputModal from "./CyclesAmountInputModal";

type TimerSettingsDialogProps = {
	onClose: () => void;
};

function TimerSettingsDialog({ onClose }: TimerSettingsDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	const nameInputId = useId();
	const titlebar = useContext(TitlebarPortalContext);
	const setTitlebarContainer = titlebar?.setContainer;
	const titlebarHeight = titlebar?.height ?? "0px";
	const [inputFeedback, setInputFeedback] = useState<string | null>(null);
	const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const handleInputFeedback = useCallback((message: string | null) => {
		if (feedbackTimeout.current !== null) clearTimeout(feedbackTimeout.current);
		feedbackTimeout.current = null;
		setInputFeedback(message);
		if (message !== null) feedbackTimeout.current = setTimeout(() => {
			setInputFeedback(null);
			feedbackTimeout.current = null;
		}, 8000);
	}, []);
	useEffect(() => () => {
		if (feedbackTimeout.current !== null) clearTimeout(feedbackTimeout.current);
	}, []);

	function handleClipboard(event: ClipboardEvent<HTMLDialogElement>) {
		if (!(event.target instanceof HTMLInputElement)) event.preventDefault();
	}

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
				// Referência fixa: trocar o valor nunca desloca a linha de base dos números.
				const metrics = context!.measureText("0123456789");
				// Centraliza o conjunto de dígitos usando as métricas da fonte atual.
				const padding = metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent
					- metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
				if (!Number.isFinite(padding)) continue;
				const top = `${Number(Math.max(0, padding).toFixed(3))}px`;
				const bottom = `${Number(Math.max(0, -padding).toFixed(3))}px`;
				if (input.style.paddingTop !== top) input.style.paddingTop = top;
				if (input.style.paddingBottom !== bottom) input.style.paddingBottom = bottom;
			}
		}

		const resizeObserver = new ResizeObserver(alignNumberInputs);
		inputs.forEach(input => resizeObserver.observe(input, { box: "border-box" }));
		const styleObserver = new MutationObserver(alignNumberInputs);
		styleObserver.observe(dialog, {
			attributes: true,
			attributeFilter: ["class", "style"],
			subtree: true,
		});
		document.fonts.addEventListener("loadingdone", alignNumberInputs);
		void document.fonts.ready.then(alignNumberInputs);
		alignNumberInputs();

		return () => {
			disposed = true;
			resizeObserver.disconnect();
			styleObserver.disconnect();
			document.fonts.removeEventListener("loadingdone", alignNumberInputs);
		};
	}, []);

	return createPortal(
		<dialog
			ref={dialogRef}
			className="modal @container-size select-none"
			style={{ paddingTop: titlebarHeight }}
			aria-labelledby={titleId}
			onCopy={handleClipboard}
			onCut={handleClipboard}
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
					<DialogTitle id={titleId} className="col-start-2 col-span-2 row-start-2">
						Editar Tomateiro
					</DialogTitle>
					<div className="
						row-start-3
						col-start-2
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<FieldLabel htmlFor={nameInputId} className="col-start-2 row-start-3">
						Nome do Temporizador
					</FieldLabel>

					<TextInput
						id={nameInputId}
						placeholder="Nome aqui.."
						containerClassName="col-start-2 col-span-2 row-start-5"
					/>

					<FieldLabel className="col-start-2 row-start-7">
						Temporizador
					</FieldLabel>

					<div className="
						col-start-2
						row-start-9

						relative
						

						min-w-0
						min-h-0
						h-full
						w-full
					">
						<TimeInputModal label="Temporizador" minutes="25" onInputFeedback={handleInputFeedback}/>
					</div>

					<div className="
						col-start-2
						row-start-10
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					<FieldLabel className="relative col-start-2 row-start-11">
						Pausa Curta
					</FieldLabel>

					<FieldLabel className="col-start-4 row-start-11">
						Pausa Longa
					</FieldLabel>



					<div className="
						col-start-4
						row-start-9
						w-[40%]
						relative
						min-w-0
						min-h-0
						h-full
						
					">
						<CyclesAmountInputModal onInputFeedback={handleInputFeedback}></CyclesAmountInputModal>
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
						<TimeInputModal label="Pausa longa" minutes="15" onInputFeedback={handleInputFeedback}/>
					</div>

					<FieldLabel className="col-start-4 row-start-7">
						Ciclos
					</FieldLabel>

					<div className="
						col-start-2
						row-start-13
						relative
						min-w-0
						min-h-0
						h-full
						w-full
					">
						<TimeInputModal label="Pausa curta" minutes="5" onInputFeedback={handleInputFeedback}/>
					</div>

					<div className="
						col-start-2
						row-start-14
						min-w-0
						min-h-0
						h-full
						w-full
					"/>

					
					<PrimaryButton className="col-start-4 row-start-15 h-full w-full">
						Salvar
					</PrimaryButton>

					<SecondaryButton
						onClick={onClose}
						className="col-start-2 col-span-2 row-start-15 mr-[8%] justify-self-end h-full w-[62%]"
					>
						Cancelar
					</SecondaryButton>
				</div>

				
				
				
			</div>
			<div role="status" aria-live="polite" aria-atomic="true" style={{ top: `calc(${titlebarHeight} + 1cqmin)` }} className="toast toast-top toast-center pointer-events-none z-10 w-[90%] max-w-[36rem] whitespace-normal p-[2cqmin] font-[Beiruti] text-[clamp(1rem,3cqmin,1.25rem)]">
				{inputFeedback && <div className="alert alert-warning alert-soft grid-cols-[minmax(0,1fr)] rounded-none p-[2cqmin] font-medium [font-size:inherit] leading-snug">
					<span className="min-w-0 break-words">{inputFeedback}</span>
				</div>}
			</div>
			<button type="button" tabIndex={-1} className="modal-backdrop absolute inset-0 col-auto row-auto" aria-label="Fechar edição" onClick={onClose} />
		</dialog>,
		document.body,
	);
}

export default TimerSettingsDialog;
