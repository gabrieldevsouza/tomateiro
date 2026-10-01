import { PiCaretDown, PiCaretUp } from "react-icons/pi";
import { useNumberInput } from "./useNumberInput";


type TimeInputModalProps = {
    label?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
};


function TimeInputModal({
    label = "Temporizador",
    hours = "0",
    minutes = "25",
    seconds = "0",
}: TimeInputModalProps) {
    const hoursInput = useNumberInput(hours, 0, 99);
    const minutesInput = useNumberInput(minutes, 0, 59);
    const secondsInput = useNumberInput(seconds, 0, 59);

         
    const inputClasses = "input input-ghost box-border block h-full w-full min-h-0 min-w-0 max-w-none content-center appearance-none rounded-none border-0 bg-transparent px-0 py-0 text-center font-[Inter] text-[min(64cqw,80cqh)] leading-[normal] tabular-nums shadow-none select-none caret-transparent selection:bg-transparent selection:text-inherit focus:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#00CBEA] [--font-size-min:0px] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0";
    const columnClasses = "grid h-full w-full min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]";
    const valueClasses = "flex h-full w-full min-h-0 min-w-0 items-center justify-center @container-size";
    const separatorClasses = "flex h-full w-full min-h-0 min-w-0 items-center justify-center text-[min(14cqw,40cqh)] leading-none";
    const arrowButtonClasses = "flex h-full w-full min-h-0 min-w-0 items-center justify-center rounded-none border-0 bg-transparent p-0 text-white/60 hover:bg-white/5 hover:text-white active:bg-white/10";
    // 10% maior que o tamanho anterior de 20cqh, relativo à altura total do campo.
    const arrowIconClasses = "block size-[22cqh] shrink-0";

    return(
    <div role="group" aria-label={label} className="h-full w-full min-h-0 min-w-0 @container-size">
        <div className={`
            input grid
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
                onClick={() => hoursInput.step(1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses}/>
            </button>

        <div className={valueClasses}>
        <input 
            {...hoursInput.inputProps}
            type="number"
            inputMode="numeric"
            step={1}
            required
            onFocus={(event) => event.currentTarget.select()}
            onClick={(event) => event.currentTarget.select()}
            aria-label={label + ":horas"}
            className={inputClasses}
        />
        </div>
        <button
        type="button"
        tabIndex={-1}
        className={arrowButtonClasses}
        aria-label={label + ":diminuir horas"}
        onClick={() => hoursInput.step(-1)}
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
            onClick = {() => minutesInput.step(1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses} />
            </button>
        <div className={valueClasses}>
        <input 
            {...minutesInput.inputProps}
            type="number"
            inputMode="numeric"
            step={1}
            required
            onFocus={(event) => event.currentTarget.select()}
            onClick={(event) => event.currentTarget.select()}
            aria-label={label + ":minutos"}
            className= {inputClasses}
            />
            </div>

            <button
            type="button"
            tabIndex={-1}
            className={arrowButtonClasses}
            aria-label={label + ":diminuir minutos"}
            onClick={() => minutesInput.step(-1)}
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
            onClick={() => secondsInput.step(1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses}/>
            </button>
        <div className={valueClasses}>
        <input 
            {...secondsInput.inputProps}
            type="number"
            inputMode="numeric"
            step={1}
            required
            onFocus={(event) => event.currentTarget.select()}
            onClick={(event) => event.currentTarget.select()}
            aria-label={label + ":segundos"}
            className={inputClasses}
            />
            </div>

            <button
            type="button"
            tabIndex={-1}
            className={arrowButtonClasses}
            aria-label={label + ":diminuir segundos"}
            onClick={() => secondsInput.step(-1)}
            >
                <PiCaretDown aria-hidden="true" className={arrowIconClasses}/>
            </button>
        </div>
        </div>
        </div>
    );
}


export default TimeInputModal;
