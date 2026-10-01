import { useRef } from "react";
import { PiCaretDown, PiCaretUp } from "react-icons/pi";
import { POMODORO_SETTINGS_LIMITS } from "../../model/pomodoroTimer";

type CyclesAmountInputModalProps ={
    defaultValue?: number;
};

function CyclesAmountInputModal({
    defaultValue = 4,
}: CyclesAmountInputModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    function changeCycles(direction: number){
        const input = inputRef.current;
        if (!input) return;
        
        if (direction > 0){
            input.stepUp();
        }else {
            input.stepDown();
        }
    }

    const inputClasses = "h-full w-full min-h-0 min-w-0 bg-transparent p-0 text-center text-[1em] leading-none tabular-nums focus:bg-white/10 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
    const arrowButtonClasses =  "btn btn-ghost flex h-full w-full min-h-0 min-w-0 items-center justify-center rounded-none border-0 bg-transparent p-0 shadow-none text-white/35 hover:bg-white/5 hover:text-white";
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
            input grid
            grid-cols-[minmax(0,3fr)_minmax(0,1fr)]
            items-center
            h-full w-full min-h-0 min-w-0
            gap-0 px-[6cqw] py-0
            rounded-none border-0
            bg-[#17243F] font-[Epilogue] text-white
            text-[min(40cqw,45cqh)]
        ">
        <input
            ref={inputRef}
            type = "number"
            min={POMODORO_SETTINGS_LIMITS.minFocusPhases}
            max={POMODORO_SETTINGS_LIMITS.maxFocusPhases}
            step={1}
            required
            defaultValue= {defaultValue}
            aria-label="Quantidade de ciclos"
            className={inputClasses}
            />
            <div className="grid h-[60%] w-full min-h-0 min-w-0 grid-rows-2">
                <button 
                    type= "button"
                    className = {arrowButtonClasses}
                    aria-label="Aumentar quantidade de cilos"
                    onClick={() => changeCycles(1)}
                    >
                        <PiCaretUp aria-hidden="true" className={arrowIconClasses}/>
                    </button>
                    <button
                        type="button"
                        className={arrowButtonClasses}
                        aria-label="Diminuir quantidade de ciclos"
                        onClick={() => changeCycles(-1)}
                        >
                        <PiCaretDown aria-hidden="true" className={arrowIconClasses}/>
                        </button>
                        </div>
                    </div>
                </div>
    );
}   

export default CyclesAmountInputModal;