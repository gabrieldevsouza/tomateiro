import type { PomodoroPhase } from "../model/pomodoroTimer";

const phaseLabels: Record<PomodoroPhase, string> = {
	focus: "Foco",
	shortBreak: "Pausa curta",
	longBreak: "Pausa longa",
};

type PhaseLabelProps = {
	phase: PomodoroPhase;
	className?: string;
};

function PhaseLabel({ phase, className = "" }: PhaseLabelProps) {
	return (
		<div className={`@container-size h-full w-full min-h-0 min-w-0 ${className}`}>
			<p
				className="flex h-full items-center justify-center whitespace-nowrap font-[Epilogue] text-[#00CBEA] leading-none"
				style={{ fontSize: "min(7cqw,40cqh)" }}
				aria-live="polite"
			>
				{phaseLabels[phase]}
			</p>
		</div>
	);
}

export default PhaseLabel;
