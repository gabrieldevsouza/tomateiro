import { PiCaretDown, PiCaretUp } from "react-icons/pi";
import { useNumberInput } from "./useNumberInput";
import CountdownNumberInput from "./CountdownNumberInput";


type TimeInputModalProps = {
    label?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
    onInputFeedback?: (message: string | null) => void;
};


function TimeInputModal({
    label = "Temporizador",
    hours = "0",
    minutes = "25",
    seconds = "0",
    onInputFeedback,
}: TimeInputModalProps) {
    const hoursInput = useNumberInput(hours, 0, 99, { wrap: true, onInputFeedback });
    const minutesInput = useNumberInput(minutes, 0, 59, { wrap: true, onInputFeedback });
    const secondsInput = useNumberInput(seconds, 0, 59, { wrap: true, onInputFeedback });

         
    const columnClasses = "grid h-full w-full min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]";
    const valueClasses = "flex h-full w-full min-h-0 min-w-0 items-center justify-center @container-size";
    const separatorClasses = "flex h-full w-full min-h-0 min-w-0 items-center justify-center text-[min(14cqw,40cqh)] leading-none";
    const arrowButtonClasses = "btn btn-ghost flex h-full w-full min-h-0 min-w-0 cursor-pointer items-center justify-center gap-0 rounded-none border-0 bg-[#17243F] bg-none p-0 text-white/60 shadow-none outline-none hover:bg-[#5F77B8] hover:text-white active:bg-[#435F91] active:text-white";
    // 10% maior que o tamanho anterior de 20cqh, relativo à altura total do campo.
    const arrowIconClasses = "block size-[22cqh] shrink-0";

    return(
    <div role="group" aria-label={label} className="h-full w-full min-h-0 min-w-0 @container-size">
        <div className={`
            input grid cursor-default
            grid-cols-[minmax(0,0.92fr)_minmax(0,0.24fr)_minmax(0,0.92fr)_minmax(0,0.24fr)_minmax(0,0.92fr)]
            items-center
            h-full
            w-full
            min-h-0
            min-w-0 max-w-none
            gap-0

			${/*px-[4cqw]*/`px-0`}
			py-0 
			border-0 
			shadow-none

            rounded-none
            bg-[#17243F] 
            font-[Epilogue]
            text-white
			`}
        >

        <div className={columnClasses}>
            <button
                type="button"
                tabIndex={-1}
                className={arrowButtonClasses}
                aria-label={label + ": aumentar horas"}
                {...hoursInput.getStepButtonProps(1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses}/>
            </button>

        <div className={valueClasses}>
        <CountdownNumberInput numberInput={hoursInput} label={label + ":horas"} />
        </div>
        <button
        type="button"
        tabIndex={-1}
        className={arrowButtonClasses}
        aria-label={label + ":diminuir horas"}
        {...hoursInput.getStepButtonProps(-1)}
        >
            <PiCaretDown aria-hidden="true" className={arrowIconClasses} />
        </button>
        </div>

        <span aria-hidden="true" className={separatorClasses}>:</span>

        <div className={columnClasses}>
            <button
            type="button"
            tabIndex={-1}
            className={arrowButtonClasses}
            aria-label={label + ":aumentar minutos"}
            {...minutesInput.getStepButtonProps(1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses} />
            </button>
        <div className={valueClasses}>
        <CountdownNumberInput numberInput={minutesInput} label={label + ":minutos"} />
            </div>

            <button
            type="button"
            tabIndex={-1}
            className={arrowButtonClasses}
            aria-label={label + ":diminuir minutos"}
            {...minutesInput.getStepButtonProps(-1)}
            >
                <PiCaretDown aria-hidden="true" className={arrowIconClasses} />
            </button>
            </div>

        <span aria-hidden="true" className={separatorClasses}>:</span>

        <div className={columnClasses}>
            <button
            type="button"
            tabIndex={-1}
            className={arrowButtonClasses}
            aria-label={label + ":aumentar segundos"}
            {...secondsInput.getStepButtonProps(1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses}/>
            </button>
        <div className={valueClasses}>
        <CountdownNumberInput numberInput={secondsInput} label={label + ":segundos"} />
            </div>

            <button
            type="button"
            tabIndex={-1}
            className={arrowButtonClasses}
            aria-label={label + ":diminuir segundos"}
            {...secondsInput.getStepButtonProps(-1)}
            >
                <PiCaretDown aria-hidden="true" className={arrowIconClasses}/>
            </button>
        </div>
        </div>
        </div>
    );
}


export default TimeInputModal;
