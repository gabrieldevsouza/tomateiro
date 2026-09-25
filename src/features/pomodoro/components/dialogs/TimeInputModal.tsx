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
        }
         
    const inputClasses = "h-full w-full min-h-0 min-w-0 bg-transparent p-0 text-center text-[1em] tabular-nums";
    const columnClasses = "grid h-full w-full min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]";
    const arrowButtonClasses = "btn btn-ghost flex h-full w-full min-h-0 min-w-0 items-center justify-center rounded-none border-0 bg-transparent p-0 shadow-none text-white/35 hover:bg-white/5 hover:text-white";
    const arrowIconClasses = "aspect-square h-[80%] w-auto max-w-full";

    return(
    <div className="absolute inset-0 h-full w-full min-h-0 min-w-0 @container-size">
        <div className="
            input
            absolute
            grid
            grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]
            items-center
            h-full
            w-full
            min-h-0
            min-w-0
            gap-0
            px-[4cqw] py-0 border-0
            bg-[#17243F] 
            font-[Epilogue]
            text-white
            text-[min(14cqw, 45cqh)]"
        >

        <div className={columnClasses}>
            <button
                type="button"
                className={arrowButtonClasses}
                aria-label={label + ": aumentar horas"}
                onClick={() => changeTimePart(hoursRef.current,1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses}/>
            </button>

        <input 
            ref={hoursRef}
            type="number"
            min={0}
            max={99}
            step={1}
            required
            defaultValue={hours}
            onBlur={(event) => formatTimePart(event.currentTarget)}
            aria-label={label + ":horas"}
            className={inputClasses}
        />
        <button
        type="button"
        className={arrowButtonClasses}
        aria-label={label + ":diminuir horas"}
        onClick={() => changeTimePart(hoursRef.current, -1)}
        >
            <PiCaretDown aria-hidden="true" className={arrowIconClasses} />
        </button>
        </div>

        <span aria-hidden>:</span>

        <div className={columnClasses}>
            <button
            type="button"
            className={arrowButtonClasses}
            aria-label={label + ":aumentar minutos"}
            onClick = {() => changeTimePart(minutesRef.current, 1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses} />
            </button>
        <input 
            ref={minutesRef}
            type="number"
            min={0}
            max={59}
            step={1}
            required
            defaultValue = {minutes}
            onBlur={(event) => formatTimePart(event.currentTarget)}
            aria-label={label + ":minutos"}
            className= {inputClasses}
            />

            <button
            type="button"
            className={arrowButtonClasses}
            aria-label={label + ":diminuir minutos"}
            onClick={() => changeTimePart(minutesRef.current, -1)}
            >
                <PiCaretDown aria-hidden="true" className={arrowIconClasses} />
            </button>
            </div>

        <span aria-hidden="true">:</span>

        <div className={columnClasses}>
            <button
            type="button"
            className={arrowButtonClasses}
            aria-label={label + ":aumentar segundos"}
            onClick={() => changeTimePart (secondsRef.current, 1)}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses}/>
            </button>
        <input 
            ref={secondsRef}
            type="number"
            min={0}
            max={59}
            step={1}
            required
            defaultValue = {seconds}
            onBlur = {(event) => formatTimePart(event.currentTarget)}
            aria-label={label + ":segundos"}
            className={inputClasses}
            />

            <button
            type="button"
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