import { useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { PiXBold } from "react-icons/pi";
import {
	POMODORO_SETTINGS_LIMITS,
	type PomodoroSettings,
} from "../model/pomodoroTimer";
import { POMODORO_SETTINGS_FIELDS, readPomodoroSettingsForm } from "../model/pomodoroSettingsForm";
import TimerControlButton from "./controls/TimerControlButton";

type TimerSettingsDialogProps = {
	settings: PomodoroSettings;
	onSave: (settings: PomodoroSettings) => void;
	onClose: () => void;
};

function TimerSettingsDialog({ settings, onSave, onClose }: TimerSettingsDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const firstInputRef = useRef<HTMLInputElement>(null);
	const id = useId();
	const [error, setError] = useState("");

	useLayoutEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}
		dialog.showModal();
		// Focus the input after the modal is presented.
		const focusFrame = window.requestAnimationFrame(() => {
			firstInputRef.current?.focus({ preventScroll: true });
		});
		return () => {
			window.cancelAnimationFrame(focusFrame);
			dialog.close();
		};
	}, []);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const nextSettings = readPomodoroSettingsForm(formData);
		if (!nextSettings) {
			setError(`Use minutos inteiros de ${POMODORO_SETTINGS_LIMITS.minMinutes} a ${POMODORO_SETTINGS_LIMITS.maxMinutes} e de ${POMODORO_SETTINGS_LIMITS.minFocusPhases} a ${POMODORO_SETTINGS_LIMITS.maxFocusPhases} focos.`);
			return;
		}
		onSave(nextSettings);
	}

	return createPortal(
		<dialog
			ref={dialogRef}
			className="modal"
			aria-labelledby={`${id}-title`}
			aria-describedby={`${id}-description`}
			onKeyDown={(event) => {
				if (event.key !== "Tab") return;
				const controls = event.currentTarget.querySelectorAll<HTMLElement>(
					'button:not([disabled]):not([tabindex="-1"]), input:not([disabled])',
				);
				const first = controls[0];
				const last = controls[controls.length - 1];
				if (event.shiftKey && document.activeElement === first) {
					event.preventDefault();
					last?.focus();
				} else if (!event.shiftKey && document.activeElement === last) {
					event.preventDefault();
					first?.focus();
				}
			}}
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
		>
			<form
				className="modal-box max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md border border-[#374468] bg-[#212940] p-5 font-[Epilogue] text-[#C2C7DA] [@media(max-height:400px)]:p-3"
				onSubmit={handleSubmit}
				onInput={() => setError("")}
			>
				<div className="flex items-center justify-between gap-4">
					<h2 id={`${id}-title`} className="text-lg font-semibold text-[#00CBEA]">Editar Pomodoro</h2>
					<div className="size-8 shrink-0 [@media(max-height:400px)]:size-6">
						<TimerControlButton
							ariaLabel="Fechar edição"
							onClick={onClose}
							bgColor="bg-transparent"
							icon={<PiXBold aria-hidden="true" className="size-1/2" />}
						/>
					</div>
				</div>
				<p id={`${id}-description`} className="mt-2 text-xs leading-relaxed text-[#C2C7DA]/80 [@media(max-height:400px)]:mt-1 [@media(max-height:400px)]:leading-snug">
					O timer continua durante a edição. Salvar alterações reinicia o bloco, pronto para Play.
				</p>
				<div className="mt-4 grid grid-cols-2 items-end gap-3 [@media(max-height:400px)]:mt-2 [@media(max-height:400px)]:gap-2 [@media(min-width:480px)_and_(max-height:400px)]:grid-cols-4">
					{POMODORO_SETTINGS_FIELDS.map((field, index) => (
						<label key={field.name} htmlFor={`${id}-${field.name}`} className="flex min-w-0 flex-col gap-2 text-xs [@media(max-height:400px)]:gap-1">
							{field.label}
							<input
								ref={index === 0 ? firstInputRef : undefined}
								id={`${id}-${field.name}`}
								name={field.name}
								type="number"
								required
								step={1}
								min={field.min}
								max={field.max}
								title={`Use um número inteiro de ${field.min} a ${field.max}.`}
								defaultValue={settings[field.name] / field.unit}
								className="input h-10 w-full border-[#5F77B8] bg-[#1D2230] text-base text-[#FFFFFF] focus:border-[#00CBEA] focus:outline-2 focus:outline-[#00CBEA] [@media(max-height:400px)]:h-8"
							/>
						</label>
					))}
				</div>
				{error && <p role="alert" className="mt-3 text-xs text-red-300">{error}</p>}
				<div className="mt-5 flex justify-end gap-2 [@media(max-height:400px)]:mt-3 [@media(max-height:400px)]:[&>button]:h-8">
					<button type="button" className="btn rounded-full border-0 bg-[#374468] text-[#C2C7DA] shadow-none hover:bg-[#5F77B8]" onClick={onClose}>
						Cancelar
					</button>
					<button type="submit" className="btn rounded-full border-0 bg-[#00CBEA] text-[#212940] shadow-none hover:bg-[#0473B8] hover:text-white">
						Salvar
					</button>
				</div>
			</form>
			<button type="button" tabIndex={-1} className="modal-backdrop" aria-label="Cancelar edição" onClick={onClose} />
		</dialog>,
		document.body,
	);
}

export default TimerSettingsDialog;
