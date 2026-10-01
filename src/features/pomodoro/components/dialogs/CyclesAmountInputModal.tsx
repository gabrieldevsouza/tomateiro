import { PiCaretDown, PiCaretUp } from "react-icons/pi";
import { POMODORO_SETTINGS_LIMITS } from "../../model/pomodoroTimer";
import { useNumberInput } from "./useNumberInput";
import CountdownNumberInput from "./CountdownNumberInput";

type CyclesAmountInputModalProps ={
    defaultValue?: number;
    onInputFeedback?: (message: string | null) => void;
};

function CyclesAmountInputModal({
    defaultValue = 4,
    onInputFeedback,
}: CyclesAmountInputModalProps) {
    const cyclesInput = useNumberInput(defaultValue, POMODORO_SETTINGS_LIMITS.minFocusPhases, POMODORO_SETTINGS_LIMITS.maxFocusPhases, { allowZeroWhileEditing: true, onInputFeedback });

    const arrowButtonClasses = "btn btn-ghost grid h-full w-full min-h-0 min-w-0 cursor-pointer justify-items-center gap-0 rounded-none border-0 bg-[#17243F] bg-none p-0 text-white/60 shadow-none outline-none hover:bg-[#5F77B8] hover:text-white active:bg-[#435F91] active:text-white";
    // Mesmo tamanho dos temporizadores, relativo ao campo inteiro, independente do botão.
    const arrowIconClasses = "block size-[22cqh] shrink-0";
    

    return(
        <div className="
            h-full 
            w-full 
            min-h-0 
            min-w-0 
            @container-size"
        >
            <div className={`
            input grid cursor-default
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
        <CountdownNumberInput numberInput={cyclesInput} label="Quantidade de ciclos" />
            </div>
            {/* Folga entre cada SVG e a borda central: percentual da altura do botão. */}
            <div className="grid h-full w-full min-h-0 min-w-0 grid-rows-2 self-stretch [--arrow-inner-gap:15%]">
                <button
                    type="button"
                    tabIndex={-1}
                    className={`${arrowButtonClasses} grid-rows-[minmax(0,1fr)_var(--arrow-inner-gap)]`}
                    aria-label="Aumentar quantidade de ciclos"
                    {...cyclesInput.getStepButtonProps(1)}
                >
                    <PiCaretUp aria-hidden="true" className={`${arrowIconClasses} self-end`}/>
                </button>
                <button
                    type="button"
                    tabIndex={-1}
                    className={`${arrowButtonClasses} grid-rows-[var(--arrow-inner-gap)_minmax(0,1fr)]`}
                    aria-label="Diminuir quantidade de ciclos"
                    {...cyclesInput.getStepButtonProps(-1)}
                >
                    <PiCaretDown aria-hidden="true" className={`${arrowIconClasses} row-start-2 self-start`}/>
                </button>
            </div>
                    </div>
                </div>
    );
}   

export default CyclesAmountInputModal;
