import { Fragment, useId } from "react";
import { PiCaretDown, PiCaretUp } from "react-icons/pi";
import { DURATION_SEGMENTS, getPomodoroDurationSegments, type PomodoroDurationSettingName } from "../../model/pomodoroSettingsForm";
import { useNumberInput } from "./useNumberInput";
import CountdownNumberInput from "./CountdownNumberInput";

export type TimeInputModalProps = {
    name: PomodoroDurationSettingName;
    label: string;
    labelledBy?: string;
    defaultValue: number;
    inputDescriptionId?: string;
    invalid?: boolean;
    onInputFeedback?: (message: string | null) => void;
};

type DurationSegmentInputProps = Pick<TimeInputModalProps, "name" | "label" | "inputDescriptionId" | "invalid" | "onInputFeedback"> & {
    segment: typeof DURATION_SEGMENTS[number];
    id: string;
    defaultValue: string;
};

function DurationSegmentInput({ segment, id, name, label, defaultValue, inputDescriptionId, invalid, onInputFeedback }: DurationSegmentInputProps) {
    const numberInput = useNumberInput(defaultValue, 0, segment.max, { wrap: true, onInputFeedback });
    const arrowButtonClasses = "btn btn-ghost flex h-full w-full min-h-0 min-w-0 cursor-pointer items-center justify-center gap-0 rounded-none border-0 bg-[#17243F] bg-none p-0 text-white/60 shadow-none outline-none hover:bg-[#5F77B8] hover:text-white active:bg-[#435F91] active:text-white";
    // 10% maior que o tamanho anterior de 20cqh, relativo à altura total do campo.
    const arrowIconClasses = "block size-[22cqh] shrink-0";

    return (
        <div className="grid h-full w-full min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]">
            <button
                type="button"
                tabIndex={-1}
                className={arrowButtonClasses}
                aria-label={label + (segment.name === "hours" ? ": aumentar " : ":aumentar ") + segment.label}
                {...numberInput.getStepButtonProps(1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses} />
            </button>
            <div className="flex h-full w-full min-h-0 min-w-0 items-center justify-center @container-size">
                <CountdownNumberInput
                    numberInput={numberInput}
                    label={label + ":" + segment.label}
                    name={`${name}.${segment.name}`}
                    id={`${id}-${segment.name}`}
                    descriptionId={inputDescriptionId}
                    invalid={invalid}
                />
            </div>
            <button
                type="button"
                tabIndex={-1}
                className={arrowButtonClasses}
                aria-label={label + ":diminuir " + segment.label}
                {...numberInput.getStepButtonProps(-1)}
            >
                <PiCaretDown aria-hidden="true" className={arrowIconClasses} />
            </button>
        </div>
    );
}

function TimeInputModal({ name, label, labelledBy, defaultValue, inputDescriptionId, invalid, onInputFeedback }: TimeInputModalProps) {
    const id = useId();
    const amounts = getPomodoroDurationSegments(defaultValue);

    return (
        <div role="group" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : label} className="h-full w-full min-h-0 min-w-0 @container-size">
            <div className="
                input grid cursor-default
                grid-cols-[minmax(0,0.92fr)_minmax(0,0.24fr)_minmax(0,0.92fr)_minmax(0,0.24fr)_minmax(0,0.92fr)]
                items-center h-full w-full min-h-0 min-w-0 max-w-none gap-0 px-0 py-0 border-0 shadow-none
                rounded-none bg-[#17243F] font-[Epilogue] text-white outline-1 -outline-offset-1 outline-[#7C8BA9]
            ">
                {DURATION_SEGMENTS.map((segment, index) => (
                    <Fragment key={segment.name}>
                        {index > 0 && <span aria-hidden="true" className="flex h-full w-full min-h-0 min-w-0 items-center justify-center text-[min(14cqw,40cqh)] leading-none">:</span>}
                        <DurationSegmentInput
                            segment={segment}
                            id={id}
                            name={name}
                            label={label}
                            defaultValue={amounts[segment.name]}
                            inputDescriptionId={inputDescriptionId}
                            invalid={invalid}
                            onInputFeedback={onInputFeedback}
                        />
                    </Fragment>
                ))}
            </div>
        </div>
    );
}

export default TimeInputModal;
