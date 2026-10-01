import { type ClipboardEvent, type FormEvent, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PrimaryButton from "../../../../components/buttons/PrimaryButton";
import SecondaryButton from "../../../../components/buttons/SecondaryButton";
import FieldLabel from "../../../../components/forms/FieldLabel";
import TextInput from "../../../../components/forms/TextInput";
import DialogTitle from "../../../../components/typography/DialogTitle";
import { TitlebarPortalContext } from "../../../../window/TitlebarPortalContext";
import TimeInputModal from "./TimeInputModal";
import CyclesAmountInputModal from "./CyclesAmountInputModal";
import { isValidPomodoroSettings, type PomodoroSettings } from "../../model/pomodoroTimer";
import { POMODORO_SETTINGS_FIELDS, parsePomodoroSettingsForm, type PomodoroSettingsFormError } from "../../model/pomodoroSettingsForm";

type TimerSettingsDialogProps = {
	settings: PomodoroSettings;
	onSave: (settings: PomodoroSettings) => void;
	onClose: () => void;
};

const editorFieldOrder: (keyof PomodoroSettings)[] = [
	"focusDurationSeconds", "focusPhasesPerCycle", "shortBreakDurationSeconds", "longBreakDurationSeconds",
];

function readFormErrors(form: HTMLFormElement): PomodoroSettingsFormError[] {
	const result = parsePomodoroSettingsForm(new FormData(form));
	const errors = result.ok ? [] : [...result.errors];
	for (const input of form.elements) {
		if (!(input instanceof HTMLInputElement) || input.validity.valid) continue;
		const field = POMODORO_SETTINGS_FIELDS.find(({ name }) => input.name === name || input.name.startsWith(name + "."));
		if (!field || errors.some((error) => error.inputName === input.name)) continue;
		errors.push({
			field: field.name,
			inputName: input.name,
			message: field.label + ": " + (input.validationMessage || "o valor não respeita as restrições deste campo."),
		});
	}
	return errors;
}

function TimerSettingsDialog({ settings, onSave, onClose }: TimerSettingsDialogProps) {
	if (!isValidPomodoroSettings(settings)) throw new RangeError("Configuração do Pomodoro inválida.");
	const dialogRef = useRef<HTMLDialogElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const titleId = useId();
	const nameInputId = useId();
	const fieldId = useId();
	const descriptionId = `${fieldId}-description`;
	const durationHelpId = `${fieldId}-duration-help`;
	const cyclesHelpId = `${fieldId}-cycles-help`;
	const nameHelpId = `${fieldId}-name-help`;
	const cyclesInputId = `${fieldId}-cycles-input`;
	const titlebar = useContext(TitlebarPortalContext);
	const setTitlebarContainer = titlebar?.setContainer;
	const titlebarHeight = titlebar?.height ?? "0px";
	const [inputFeedback, setInputFeedback] = useState<string | null>(null);
	const [errors, setErrors] = useState<PomodoroSettingsFormError[]>([]);
	const [focusedField, setFocusedField] = useState<keyof PomodoroSettings | null>(null);
	const errorFocusFrame = useRef<number | null>(null);
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
		if (errorFocusFrame.current !== null) window.cancelAnimationFrame(errorFocusFrame.current);
	}, []);

	function descriptionFor(field: keyof PomodoroSettings) {
		const helpId = field === "focusPhasesPerCycle" ? cyclesHelpId : durationHelpId;
		return errors.some((error) => error.field === field) ? `${helpId} ${fieldId}-${field}-error` : helpId;
	}

	function showErrors(form: HTMLFormElement, nextErrors: PomodoroSettingsFormError[]) {
		const orderedErrors = editorFieldOrder.flatMap((field) => nextErrors.filter((error) => error.field === field));
		setErrors(orderedErrors);
		if (errorFocusFrame.current !== null) window.cancelAnimationFrame(errorFocusFrame.current);
		errorFocusFrame.current = window.requestAnimationFrame(() => {
			errorFocusFrame.current = null;
			if (!form.isConnected) return;
			const firstError = orderedErrors[0];
			const input = firstError && form.elements.namedItem(firstError.inputName);
			if (input instanceof HTMLInputElement) {
				input.focus({ preventScroll: true });
				input.select();
			}
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		// Native constraints must also hold for a programmatically dispatched submit.
		if (!form.checkValidity()) return;
		const result = parsePomodoroSettingsForm(new FormData(form));
		if (!result.ok) {
			showErrors(form, result.errors);
			return;
		}
		onSave(result.settings);
	}

	function handleInvalid(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		showErrors(event.currentTarget, readFormErrors(event.currentTarget));
	}

	function handleFormInput(event: FormEvent<HTMLFormElement>) {
		const input = event.target;
		if (!(input instanceof HTMLInputElement)) return;
		const field = editorFieldOrder.find((name) => input.name === name || input.name.startsWith(`${name}.`));
		if (!field || !errors.some((error) => error.field === field)) return;
		const fieldErrors = readFormErrors(event.currentTarget).filter((error) => error.field === field);
		setErrors((current) => editorFieldOrder.flatMap((name) => name === field
			? fieldErrors : current.filter((error) => error.field === name)));
	}

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
			const activeElement = document.activeElement;
			// A click can focus the deferred name even though it is outside the Tab order.
			const isBeforeFirst = first && activeElement &&
				(activeElement.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
			if (event.shiftKey && (activeElement === first || isBeforeFirst)) {
				event.preventDefault();
				last?.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first?.focus();
			}
		}
		dialog.addEventListener("keydown", handleDialogKeyDown);
		const focusFrame = window.requestAnimationFrame(() => {
			formRef.current?.querySelector<HTMLInputElement>('input[name="focusDurationSeconds.hours"]')?.focus({ preventScroll: true });
		});
		return () => {
			window.cancelAnimationFrame(focusFrame);
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
				// O countdown usa a mesma linha de base, em em para acompanhar o resize imediatamente.
				const wrapper = input.closest<HTMLElement>(".pomodoro-number-input");
				const offset = `${Number((padding / (2 * parseFloat(style.fontSize))).toFixed(6))}em`;
				if (wrapper && wrapper.style.getPropertyValue("--pomodoro-input-offset") !== offset) {
					wrapper.style.setProperty("--pomodoro-input-offset", offset);
				}
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

	const visibleError = errors.find((error) => error.field === focusedField) ?? errors[0];
	const invalidFieldCount = new Set(errors.map((error) => error.field)).size;

	return createPortal(
		<dialog
			ref={dialogRef}
			className="modal @container-size select-none"
			style={{ paddingTop: titlebarHeight }}
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			onCopy={handleClipboard}
			onCut={handleClipboard}
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
		>
			{/* 70cqmin = 70% do menor lado da área disponível abaixo da titlebar. */}
			<div className="modal-box relative aspect-square h-auto max-h-none w-[70cqmin] max-w-none border border-[#374468] bg-[#212940] p-0">
				<form
					ref={formRef}
					onSubmit={handleSubmit}
					onInvalidCapture={handleInvalid}
					onInput={handleFormInput}
					onBlur={handleFormInput}
					onFocusCapture={(event) => {
						const input = event.target;
						setFocusedField(input instanceof HTMLInputElement
							? editorFieldOrder.find((name) => input.name === name || input.name.startsWith(name + ".")) ?? null
							: null);
					}}
					className="
						bg-[#233E63]
						h-full
						w-full
						grid
						@container-size [&>div]:@container-size
						grid-cols-[minmax(0,15fr)_minmax(0,164fr)_minmax(0,82fr)_minmax(0,164fr)_minmax(0,15fr)]
						grid-rows-[minmax(0,15fr)_minmax(0,52fr)_minmax(0,10fr)_minmax(0,10fr)_minmax(0,44fr)_minmax(0,22fr)_minmax(0,10fr)_minmax(0,10fr)_minmax(0,52fr)_minmax(0,22fr)_minmax(0,10fr)_minmax(0,10fr)_minmax(0,52fr)_minmax(0,30fr)_minmax(0,40fr)_minmax(0,15fr)]
					"
				>
					<DialogTitle id={titleId} className="col-start-2 col-span-2 row-start-2">
						Editar Tomateiro
					</DialogTitle>
					<div className="row-start-3 col-start-2 min-w-0 min-h-0 h-full w-full" />
					<FieldLabel htmlFor={nameInputId} className="col-start-2 row-start-3">
						Nome do Temporizador
					</FieldLabel>
					<TextInput
						id={nameInputId}
						placeholder="Disponível em etapa futura"
						readOnly
						tabIndex={-1}
						aria-describedby={nameHelpId}
						containerClassName="col-start-2 col-span-2 row-start-5"
					/>
					<FieldLabel id={fieldId + "-focus-label"} className="col-start-2 row-start-7">
						Temporizador
					</FieldLabel>
					<div className="col-start-2 row-start-9 relative min-w-0 min-h-0 h-full w-full">
						<TimeInputModal
							name="focusDurationSeconds"
							label="Temporizador"
							labelledBy={fieldId + "-focus-label"}
							defaultValue={settings.focusDurationSeconds}
							inputDescriptionId={descriptionFor("focusDurationSeconds")}
							invalid={errors.some((error) => error.field === "focusDurationSeconds")}
							onInputFeedback={handleInputFeedback}
						/>
					</div>
					<FieldLabel htmlFor={cyclesInputId} className="col-start-4 row-start-7">
						Ciclos
					</FieldLabel>
					<div className="col-start-4 row-start-9 w-[40%] relative min-w-0 min-h-0 h-full">
						<CyclesAmountInputModal
							id={cyclesInputId}
							defaultValue={settings.focusPhasesPerCycle}
							descriptionId={descriptionFor("focusPhasesPerCycle")}
							invalid={errors.some((error) => error.field === "focusPhasesPerCycle")}
							onInputFeedback={handleInputFeedback}
						/>
					</div>
					<div className="col-start-2 row-start-10 min-w-0 min-h-0 h-full w-full" />
					<FieldLabel id={fieldId + "-short-label"} className="relative col-start-2 row-start-11">
						Pausa Curta
					</FieldLabel>
					<div className="col-start-2 row-start-13 relative min-w-0 min-h-0 h-full w-full">
						<TimeInputModal
							name="shortBreakDurationSeconds"
							label="Pausa curta"
							labelledBy={fieldId + "-short-label"}
							defaultValue={settings.shortBreakDurationSeconds}
							inputDescriptionId={descriptionFor("shortBreakDurationSeconds")}
							invalid={errors.some((error) => error.field === "shortBreakDurationSeconds")}
							onInputFeedback={handleInputFeedback}
						/>
					</div>
					<FieldLabel id={fieldId + "-long-label"} className="col-start-4 row-start-11">
						Pausa Longa
					</FieldLabel>
					<div className="col-start-4 row-start-13 relative min-w-0 min-h-0 h-full w-full">
						<TimeInputModal
							name="longBreakDurationSeconds"
							label="Pausa longa"
							labelledBy={fieldId + "-long-label"}
							defaultValue={settings.longBreakDurationSeconds}
							inputDescriptionId={descriptionFor("longBreakDurationSeconds")}
							invalid={errors.some((error) => error.field === "longBreakDurationSeconds")}
							onInputFeedback={handleInputFeedback}
						/>
					</div>
					<div className="col-start-2 row-start-14 min-w-0 min-h-0 h-full w-full" />
					<SecondaryButton
						type="button"
						onClick={onClose}
						className="col-start-2 col-span-2 row-start-15 mr-[8%] justify-self-end h-full w-[62%]"
					>
						Cancelar
					</SecondaryButton>
					<PrimaryButton type="submit" className="col-start-4 row-start-15 h-full w-full">
						Salvar
					</PrimaryButton>
				</form>
			</div>
			<div className="sr-only">
				<p id={descriptionId}>O timer continua durante a edição. Salvar alterações reinicia o bloco, pronto para Play.</p>
				<p id={durationHelpId}>Horas de 0 a 99; minutos e segundos de 0 a 59. Duração total de 00:00:01 a 99:59:59.</p>
				<p id={cyclesHelpId}>Ciclos: de 1 a 12 focos por bloco, com uma pausa longa após o último foco.</p>
				<p id={nameHelpId}>O nome do temporizador estará disponível em uma etapa futura.</p>
				{editorFieldOrder.map((field) => {
					const fieldErrors = errors.filter((error) => error.field === field);
					return fieldErrors.length > 0 && <p key={field} id={fieldId + "-" + field + "-error"}>{fieldErrors.map((error) => error.message).join(" ")}</p>;
				})}
			</div>
			<div
				role={visibleError ? "alert" : "status"}
				aria-live={visibleError ? "assertive" : "polite"}
				aria-atomic="true"
				style={{ top: "calc(" + titlebarHeight + " + 1cqmin)" }}
				className="toast toast-top toast-center pointer-events-none z-10 w-[90%] max-w-[36rem] whitespace-normal p-[1cqmin] font-[Beiruti] text-[clamp(0.75rem,3cqmin,1.25rem)]"
			>
				{(visibleError || inputFeedback) && <div className="alert alert-warning alert-soft grid-cols-[minmax(0,1fr)] rounded-none p-[1cqmin] font-medium [font-size:inherit] leading-tight">
					<span className="min-w-0 break-words">
						{visibleError?.message ?? inputFeedback}
						{visibleError && invalidFieldCount > 1 && " (" + invalidFieldCount + " campos precisam de correção.)"}
					</span>
				</div>}
			</div>
			{!visibleError && !inputFeedback && <p className="pointer-events-none absolute bottom-[1cqmin] z-10 m-0 w-[90%] justify-self-center text-center font-[Beiruti] text-[clamp(0.75rem,2.5cqmin,1rem)] leading-tight">
				Editar mantém a contagem; salvar alterações reinicia o bloco.
			</p>}
			<button type="button" tabIndex={-1} className="modal-backdrop absolute inset-0 col-auto row-auto" aria-label="Fechar edição" onClick={onClose} />
		</dialog>,
		document.body,
	);
}

export default TimerSettingsDialog;
