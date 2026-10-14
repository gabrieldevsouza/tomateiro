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
        <div className="pomodoro-number-input group/number-input relative h-full w-full min-h-0 min-w-0 font-[Inter] text-[min(64cqw,80cqh)] leading-[normal] lining-nums tabular-nums">
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
                className="input input-ghost box-border block h-full w-full min-h-0 min-w-0 max-w-none content-center appearance-none rounded-none border-0 bg-transparent px-0 py-0 text-center font-[Inter] text-[min(64cqw,80cqh)] text-transparent leading-[normal] lining-nums tabular-nums shadow-none select-none caret-transparent selection:bg-transparent selection:text-transparent focus:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#00CBEA] [--font-size-min:0px] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0"
            />
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span
                    className="countdown pomodoro-countdown pomodoro-input-countdown [transform:translateY(var(--pomodoro-input-offset,0em))] group-focus-within/number-input:text-base-content"
                    style={{ "--pomodoro-input-duration": `${numberInput.transitionMs}ms` } as CSSProperties}
                >
                    {/* Follow the input's repeat duration without changing DaisyUI's pseudo-element content. */}
                    <span
                        className="
                            [--pomodoro-countdown-digits:calc(1_+_var(--show-tens)_+_var(--show-hundreds))]
                            w-[calc(var(--pomodoro-countdown-digits)*1ch)]
                            [transition:--pomodoro-countdown-digits_var(--pomodoro-input-duration)_ease-out]
                            [&::before]:[--pomodoro-countdown-row:var(--first-digits)]
                            [&::before]:[--pomodoro-countdown-digits:calc(1_+_var(--show-hundreds))]
                            [&::after]:[--pomodoro-countdown-row:var(--value-ones)]
                            [&::before]:top-[calc(var(--pomodoro-countdown-row)*-1em)]
                            [&::after]:top-[calc(var(--pomodoro-countdown-row)*-1em)]
                            [&::before]:w-[calc(var(--pomodoro-countdown-digits)*1ch)]
                            [&::after]:w-[calc(var(--pomodoro-countdown-digits)*1ch)]
                            [&::before]:[transition:--pomodoro-countdown-row_var(--pomodoro-input-duration)_cubic-bezier(1,0,0,1),--pomodoro-countdown-digits_var(--pomodoro-input-duration)_ease-out,opacity_var(--pomodoro-input-duration)_ease-out]
                            [&::after]:[transition:--pomodoro-countdown-row_var(--pomodoro-input-duration)_cubic-bezier(1,0,0,1),--pomodoro-countdown-digits_var(--pomodoro-input-duration)_ease-out,opacity_var(--pomodoro-input-duration)_ease-out]
                            motion-reduce:transition-none
                            motion-reduce:[&::before]:transition-none
                            motion-reduce:[&::after]:transition-none
                        "
                        style={{ "--value": Number(numberInput.displayValue), "--digits": 1 } as CSSProperties}
                    >
                        {numberInput.displayValue}
                    </span>
                </span>
            </span>
        </div>
    );
}

export default CountdownNumberInput;
