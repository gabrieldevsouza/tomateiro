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
        <span aria-hidden>:</span>
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
            "
        />
        <span aria-hidden>:</span>
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
            "
        />
        </div>
        </div>
    );
}


export default TimeInputModal;