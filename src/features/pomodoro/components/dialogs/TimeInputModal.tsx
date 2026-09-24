import { PiCaretDown, PiCaretUp } from "react-icons/pi";


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
    const inputClasses = "h-full w-full min-h-0 min-w-0 bg-transparent p-0 text-center text-[1em] tabular-nums";
    const columnClasses = "grid h-full w-full min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]";
    const arrowButtonClasses = "btn btn-ghost flex h-full w-full min-h-0 min-w-0 items-center justify-center rounded-none border-0 bg-transparent p-0 shadow-none text-white/35 hover:bg-white/5 hover:text-white";
    const arrowIconClasses = "aspect-square h-[80%] w-auto max-w-full";

    return(
        <div className="
            absolute
            inset-0
            h-full
            w-full
            min-h-0
            min-w-0
            @container-size"
        >
        <div className="
            input
            grid
            grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]
            items-center
            h-full
            w-full
            min-w-0
            min-h-0
            gap-0
            px-[4cqw] py-0
            border-0
            bg-[#17243F]
            font-[Epilogue]
            text-white
            text-[min(14cqw,45cqh)]
            absolute
        ">
        <div className={columnClasses}>
            <button
                type="button"
                className={arrowButtonClasses}
                aria-label={label + ": aumentar horas"}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses}/>
            </button>

        <input 
            type="text"
            defaultValue={hours}
            maxLength={2}
            className="
                h-full 
                w-full 
                min-h-0 
                min-w-0 
                bg-transparent 
                p-0 
                text-center 
                text[1em] 
                tabular-nums
            "
        />

        <button
        type="button"
        className={arrowButtonClasses}
        aria-label={label + ":diminuir horas"}
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
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses} />
            </button>
        <input 
            type="text"
            defaultValue={minutes}
            maxLength={2}
            className="
                h-full 
                w-full 
                min-h-0 
                min-w-0 
                bg-transparent 
                p-0 
                text-center 
                text[1em] 
                tabular-nums
            "/>
            <button
            type="button"
            className={arrowButtonClasses}
            aria-label={label + ":diminuir minutos"}
            >
                <PiCaretDown aria-hidden="true" className={arrowIconClasses}/>
            </button>
            </div>

        <span aria-hidden>:</span>

        <div className={columnClasses}>
            <button
            type="button"
            className={arrowButtonClasses}
            aria-label={label + ":aumentar segundos"}
            >
                <PiCaretUp aria-hidden="true" className={arrowIconClasses}/>
            </button>
        <input 
            type="text"
            defaultValue={seconds}
            maxLength={2}
            className="
                h-full 
                w-full 
                min-h-0 
                min-w-0 
                bg-transparent 
                p-0 
                text-center 
                text[1em] 
                tabular-nums
            "/>
            <button
            type="button"
            className={arrowButtonClasses}
            aria-label={label + ":diminuir segundos"}
            >
                <PiCaretDown aria-hidden="true" className={arrowIconClasses}/>
            </button>
        </div>
        </div>
        </div>
    );
}


export default TimeInputModal;