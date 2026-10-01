import { type CSSProperties } from "react";
import { useNumberInput } from "./useNumberInput";

export type CountdownNumberInputProps = {
    numberInput: ReturnType<typeof useNumberInput>;
    label: string;
    name?: string;
    id?: string;
    descriptionId?: string;
    invalid?: boolean;
};

function CountdownNumberInput({ numberInput, label, name, id, descriptionId, invalid }: CountdownNumberInputProps) {
    return (
        <div className="pomodoro-number-input relative h-full w-full min-h-0 min-w-0 font-[Inter] text-[min(64cqw,80cqh)] leading-[normal] lining-nums tabular-nums">
            <input
                {...numberInput.inputProps}
                name={name}
                id={id}
                type="number"
                inputMode="numeric"
                step={1}
                required
                onFocus={(event) => event.currentTarget.select()}
                onClick={(event) => event.currentTarget.select()}
                aria-label={label}
                aria-describedby={descriptionId}
                aria-invalid={invalid || undefined}
                className="input input-ghost box-border block h-full w-full min-h-0 min-w-0 max-w-none content-center appearance-none rounded-none border-0 bg-transparent px-0 py-0 text-center font-[Inter] text-[min(64cqw,80cqh)] leading-[normal] lining-nums tabular-nums shadow-none select-none caret-transparent selection:bg-transparent selection:text-inherit focus:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#00CBEA] [--font-size-min:0px] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0"
            />
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span
                    className="countdown pomodoro-countdown pomodoro-input-countdown"
                    style={{ "--pomodoro-input-duration": `${numberInput.transitionMs}ms` } as CSSProperties}
                >
                    <span style={{ "--value": Number(numberInput.displayValue), "--digits": 1 } as CSSProperties}>
                        {numberInput.displayValue}
                    </span>
                </span>
            </span>
        </div>
    );
}

export default CountdownNumberInput;
