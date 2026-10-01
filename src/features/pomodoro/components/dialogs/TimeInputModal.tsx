import { PiCaretDown, PiCaretUp } from "react-icons/pi";
import { useRef } from "react";


type TimeInputModalProps = {
    label?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
};


function TimeInputModal({
    label = "Temporizador",
    hours = "00",
    minutes = "25",
    seconds = "00",
}: TimeInputModalProps) {
    const hoursRef = useRef <HTMLInputElement>(null);
    const minutesRef = useRef <HTMLInputElement>(null);
    const secondsRef = useRef <HTMLInputElement>(null);
    function formatTimePart(input: HTMLInputElement){
        if (input.value !=="" && input.validity.valid){
            input.value = String(input.valueAsNumber).padStart(2, "0");
        }
    }

    function changeTimePart(
        input: HTMLInputElement | null,
        direction: number,
    ) {
        if (!input) return;
        if (direction > 0){
            input.stepUp();
        } else {
            input.stepDown();
        }
        formatTimePart(input);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus({ preventScroll: true });
        }
         
    const inputClasses = "h-full w-full min-h-0 min-w-0 appearance-none border-0 bg-transparent p-0 text-center text-[min(64cqw,80cqh)] leading-none tabular-nums focus:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#00CBEA] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0";
    const columnClasses = "grid h-full w-full min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]";
    const valueClasses = "flex h-full w-full min-h-0 min-w-0 items-center justify-center @container-size";
    const separatorClasses = "flex h-full w-full min-h-0 min-w-0 items-center justify-center text-[min(14cqw,40cqh)] leading-none";
    const arrowButtonClasses = "flex h-full w-full min-h-0 min-w-0 items-center justify-center rounded-none border-0 bg-transparent p-0 text-white/60 hover:bg-white/5 hover:text-white active:bg-white/10";
    const arrowIconClasses = "aspect-square h-[80%] w-auto max-w-full";

    return(
    <div role="group" aria-label={label} className="h-full w-full min-h-0 min-w-0 @container-size">
        <div className="
            grid
            grid-cols-[minmax(0,1fr)_minmax(0,0.12fr)_minmax(0,1fr)_minmax(0,0.12fr)_minmax(0,1fr)]
            items-center
            h-full
            w-full
            min-h-0
            min-w-0
            gap-0
            px-[4cqw] py-0 border-0
            rounded-[8cqh]
            bg-[#17243F] 
            font-[Epilogue]
            text-white"
        >

        <div className={columnClasses}>
            <button
                type="button"
                tabIndex={-1}
                className={arrowButtonClasses}
                aria-label={label + ": aumentar horas"}
                onClick={() => changeTimePart(hoursRef.current,1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses}/>
            </button>

        <div className={valueClasses}>
        <input 
            ref={hoursRef}
            type="number"
            inputMode="numeric"
            min={0}
            max={99}
            step={1}
            required
            defaultValue={hours}
            onFocus={(event) => event.currentTarget.select()}
            onBlur={(event) => formatTimePart(event.currentTarget)}
            aria-label={label + ":horas"}
            className={inputClasses}
        />
        </div>
        <button
        type="button"
        tabIndex={-1}
        className={arrowButtonClasses}
        aria-label={label + ":diminuir horas"}
        onClick={() => changeTimePart(hoursRef.current, -1)}
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
            onClick = {() => changeTimePart(minutesRef.current, 1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses} />
            </button>
        <div className={valueClasses}>
        <input 
            ref={minutesRef}
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            step={1}
            required
            defaultValue = {minutes}
            onFocus={(event) => event.currentTarget.select()}
            onBlur={(event) => formatTimePart(event.currentTarget)}
            aria-label={label + ":minutos"}
            className= {inputClasses}
            />
            </div>

            <button
            type="button"
            tabIndex={-1}
            className={arrowButtonClasses}
            aria-label={label + ":diminuir minutos"}
            onClick={() => changeTimePart(minutesRef.current, -1)}
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
            onClick={() => changeTimePart (secondsRef.current, 1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses}/>
            </button>
        <div className={valueClasses}>
        <input 
            ref={secondsRef}
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            step={1}
            required
            defaultValue = {seconds}
            onFocus={(event) => event.currentTarget.select()}
            onBlur = {(event) => formatTimePart(event.currentTarget)}
            aria-label={label + ":segundos"}
            className={inputClasses}
            />
            </div>

            <button
            type="button"
            tabIndex={-1}
            className={arrowButtonClasses}
            aria-label={label + ":diminuir segundos"}
            onClick={() => changeTimePart(secondsRef.current, -1)}
            >
                <PiCaretDown aria-hidden="true" className={arrowIconClasses}/>
            </button>
        </div>
        </div>
        </div>
    );
}


export default TimeInputModal;