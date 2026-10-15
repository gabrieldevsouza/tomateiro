import { Fragment, type CSSProperties } from "react";

export type TimerDisplayMode = "digital" | "countdown";

type TimerDisplayProps = {
	remainingMs: number;
	mode?: TimerDisplayMode;
};

// Epilogue regular: countdown's 1ch digit slots, colon advance and visible digit height, in em.
// Fit the glyphs rather than the font's line box; remeasure if the typeface changes.
const EPILOGUE_METRICS = { digitSlotWidth: 0.5685, separatorWidth: 0.2575, digitHeight: 0.766 };

function TimerDisplay({ remainingMs, mode = "countdown" }: TimerDisplayProps) {
	const totalSeconds = Math.ceil(remainingMs / 1_000);
	const hours = Math.floor(totalSeconds / 3_600);
	const minutes = Math.floor(totalSeconds / 60) % 60;
	const seconds = totalSeconds % 60;
	const timeParts = [...(hours > 0 ? [hours] : []), minutes, seconds]
		.map((part) => String(part).padStart(2, "0"));
	const formattedTime = timeParts.join(":");
	const separatorCount = timeParts.length - 1;
	const widthEm = (formattedTime.length - separatorCount) * EPILOGUE_METRICS.digitSlotWidth
		+ separatorCount * EPILOGUE_METRICS.separatorWidth;

	return (
		<div className="@container-size h-full w-full min-h-0 min-w-0 overflow-hidden">
			<time
				dateTime={`PT${totalSeconds}S`}
				className="
					flex
					h-full
					w-full
					items-center
					justify-center
					font-[Epilogue]
					text-[#00CBEA]
					leading-none
					tabular-nums
					select-none
				"
				style={{
					fontSize: `min(${100 / widthEm}cqw,${100 / EPILOGUE_METRICS.digitHeight}cqh)`,
					transform: "translateY(0.09em)",
				}}
				aria-label={`${hours > 0 ? `${hours} horas, ` : ""}${minutes} minutos e ${seconds} segundos restantes`}
			>
				{mode === "digital" ? formattedTime : timeParts.map((part, index) => (
					<Fragment key={timeParts.length - index}>
						{index > 0 && ":"}
						<span
							className="countdown pomodoro-countdown shrink-0"
							aria-hidden="true"
						>
							{/* DaisyUI wraps at 1000; split longer hour fields to keep every digit. */}
							{/* Preserve its pseudo-element content while animating numeric rows and widths. */}
							{(part.length > 3 ? part.split("") : [part]).map((value, digitIndex) => (
								<span
									key={digitIndex}
									className="
										[--pomodoro-countdown-digits:calc(1+var(--show-tens)+var(--show-hundreds))]
										w-[calc(var(--pomodoro-countdown-digits)*1ch)]
										[transition:--pomodoro-countdown-digits_0.4s_ease-out_0.2s]
										[&::before]:[--pomodoro-countdown-row:var(--first-digits)]
										[&::before]:[--pomodoro-countdown-digits:calc(1+var(--show-hundreds))]
										[&::after]:[--pomodoro-countdown-row:var(--value-ones)]
										[&::before]:top-[calc(var(--pomodoro-countdown-row)*-1em)]
										[&::after]:top-[calc(var(--pomodoro-countdown-row)*-1em)]
										[&::before]:w-[calc(var(--pomodoro-countdown-digits)*1ch)]
										[&::after]:w-[calc(var(--pomodoro-countdown-digits)*1ch)]
										[&::before]:[transition:--pomodoro-countdown-row_1s_cubic-bezier(1,0,0,1),--pomodoro-countdown-digits_0.2s_ease-out_0.2s,opacity_0.2s_ease-out_0.2s]
										[&::after]:[transition:--pomodoro-countdown-row_1s_cubic-bezier(1,0,0,1),--pomodoro-countdown-digits_0.2s_ease-out_0.2s,opacity_0.2s_ease-out_0.2s]
										motion-reduce:transition-none
										motion-reduce:[&::before]:transition-none
										motion-reduce:[&::after]:transition-none
									"
									style={{
										"--value": Number(value),
										"--digits": value.length,
										// Keep Epilogue's next row outside the countdown window.
										clipPath: "inset(0 0 0.08em)",
									} as CSSProperties}
								>
									{value}
								</span>
							))}
						</span>
					</Fragment>
				))}
			</time>
		</div>
	);
}

export default TimerDisplay;
