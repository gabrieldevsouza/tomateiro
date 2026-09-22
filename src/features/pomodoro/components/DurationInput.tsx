import { useRef } from "react";
import { PiCaretDown, PiCaretUp } from "react-icons/pi";
import { DURATION_SEGMENTS } from "../model/pomodoroSettingsForm";

type DurationInputProps = {
	name: string;
	label: string;
	defaultValue: number;
};

function padSegment(input: HTMLInputElement) {
	if (input.value !== "" && input.validity.valid) {
		input.value = String(input.valueAsNumber).padStart(2, "0");
	}
}

function DurationInput({ name, label, defaultValue }: DurationInputProps) {
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	function stepSegment(index: number, direction: number) {
		const input = inputRefs.current[index];
		if (!input) return;
		if (direction > 0) input.stepUp();
		else input.stepDown();
		padSegment(input);
		// Programmatic stepping must also clear the form's previous error.
		input.dispatchEvent(new Event("input", { bubbles: true }));
		input.focus({ preventScroll: true });
	}

	return (
		<fieldset className="min-w-0">
			<legend className="mb-1 text-xs">{label}</legend>
			<div className="flex items-center rounded-lg border border-[#5F77B8] bg-[#1D2230] px-1 focus-within:border-[#00CBEA]">
				{DURATION_SEGMENTS.map((segment, index) => {
					const amount = Math.floor(defaultValue / segment.unit);
					const value = segment.name === "hours" ? amount : amount % 60;
					return (
						<div key={segment.name} className="contents">
							{index > 0 && <span aria-hidden="true" className="text-sm text-[#C2C7DA]/70">:</span>}
							<div className="flex min-w-0 flex-1 flex-col items-center">
								<button type="button" tabIndex={-1} aria-label={`Aumentar ${segment.label} de ${label}`} onClick={() => stepSegment(index, 1)} className="flex h-4 w-full items-center justify-center rounded text-[#C2C7DA]/70 hover:bg-[#374468] hover:text-[#00CBEA] active:bg-[#5F77B8]">
									<PiCaretUp aria-hidden="true" className="size-3" />
								</button>
								<input
									ref={(input) => { inputRefs.current[index] = input; }}
									name={`${name}.${segment.name}`}
									aria-label={`${label}: ${segment.label}`}
									title={`${segment.label}: 0 a ${segment.max}`}
									type="number"
									inputMode="numeric"
									min={0}
									max={segment.max}
									step={1}
									required
									defaultValue={String(value).padStart(2, "0")}
									onFocus={(event) => event.currentTarget.select()}
									onBlur={(event) => padSegment(event.currentTarget)}
									className="h-7 w-full min-w-0 appearance-none rounded bg-transparent p-0 text-center text-lg font-semibold tabular-nums text-white outline-none focus:bg-[#374468] focus:outline-1 focus:outline-[#00CBEA] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
								<button type="button" tabIndex={-1} aria-label={`Diminuir ${segment.label} de ${label}`} onClick={() => stepSegment(index, -1)} className="flex h-4 w-full items-center justify-center rounded text-[#C2C7DA]/70 hover:bg-[#374468] hover:text-[#00CBEA] active:bg-[#5F77B8]">
									<PiCaretDown aria-hidden="true" className="size-3" />
								</button>
							</div>
						</div>
					);
				})}
			</div>
		</fieldset>
	);
}

export default DurationInput;
