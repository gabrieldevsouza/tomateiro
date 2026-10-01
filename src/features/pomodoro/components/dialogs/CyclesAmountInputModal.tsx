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
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus({ preventScroll: true });
    }

    const inputClasses = "input input-ghost box-border block h-full w-full min-h-0 min-w-0 max-w-none content-center appearance-none rounded-none border-0 bg-transparent px-0 py-0 text-center font-[Inter] text-[min(64cqw,80cqh)] leading-[normal] tabular-nums shadow-none select-none caret-transparent selection:bg-transparent selection:text-inherit focus:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#00CBEA] [--font-size-min:0px] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0";
    const arrowButtonClasses = "flex h-full w-full min-h-0 min-w-0 items-center justify-center rounded-none border-0 bg-transparent p-0 text-white/60 hover:bg-white/5 hover:text-white active:bg-white/10";
    const arrowIconClasses = "aspect-square h-[80%] w-auto max-w-full";
    

    return(
        <div className="
            h-full 
            w-full 
            min-h-0 
            min-w-0 
            @container-size"
        >
            <div className={`
            input grid
            grid-cols-[minmax(0,3fr)_minmax(0,1fr)]
            items-center
            h-full w-full min-h-0 min-w-0 max-w-none
            
			gap-0 
			${/*px-[4cqw]*/`px-0`}
			py-0

            rounded-none border-0 shadow-none
            bg-[#17243F] font-[Epilogue] text-white
        `}>
        <div className="flex h-full w-full min-h-0 min-w-0 items-center justify-center @container-size">
        <input
            ref={inputRef}
            type = "number"
            inputMode="numeric"
            min={POMODORO_SETTINGS_LIMITS.minFocusPhases}
            max={POMODORO_SETTINGS_LIMITS.maxFocusPhases}
            step={1}
            required
            defaultValue= {defaultValue}
            onFocus={(event) => event.currentTarget.select()}
            onClick={(event) => event.currentTarget.select()}
            aria-label="Quantidade de ciclos"
            className={inputClasses}
            />
            </div>
            <div className="grid h-[60%] w-full min-h-0 min-w-0 grid-rows-2 self-center">
                <button
                    type="button"
                    tabIndex={-1}
                    className={arrowButtonClasses}
                    aria-label="Aumentar quantidade de ciclos"
                    onClick={() => changeCycles(1)}
                >
                    <PiCaretUp aria-hidden="true" className={arrowIconClasses}/>
                </button>
                <button
                    type="button"
                    tabIndex={-1}
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
