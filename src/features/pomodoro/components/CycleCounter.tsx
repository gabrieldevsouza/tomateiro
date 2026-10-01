import CircularProgress from "./pomodoroViewer/CircularProgress";
import type { CSSProperties } from "react";

type CycleCounterProps = {
    focusProgress: number[];
};

function CycleCounter({ focusProgress }: CycleCounterProps) {
    // A partir desta quantidade, os medidores usam o zigzag.
    const minCyclesForZigzag = 6;
    // Teto do diâmetro: use um comprimento CSS, como "48px" ou "70cqmin".
    const maxCycleDiameter = "50cqmin";
    // No zigzag, 1 = passo original; 0.8 = 20% mais perto, independentemente do teto.
    const horizontalSpacing = .6;
    const verticalSpacing = 1;
    // true começa em cima; false começa embaixo.
    const startAtTop = false;
    const isZigzag = focusProgress.length >= minCyclesForZigzag;
    const alignment = isZigzag || focusProgress.length === 1 ? "justify-center" : "justify-between";

    return (
        <div
            role="group"
            aria-label={focusProgress.length === 1 ? "Progresso do foco do ciclo" : `Progresso dos ${focusProgress.length} focos do ciclo`}
            className={`
                h-full
                w-full
                min-h-0
                min-w-0

                flex
                flex-row
                items-center
                ${alignment}
                @container-size
            `}
        >
            {isZigzag ? (
                <div
                    className="
                        relative
                        shrink-0
                        [--cycle-step:min(50cqmin,calc(100cqw/var(--cycle-count)))]
                    "
                    style={{
                        "--cycle-count": Math.max(1, focusProgress.length),
                        "--cycle-step-x": `calc(var(--cycle-step) * ${horizontalSpacing})`,
                        "--cycle-step-y": `calc(var(--cycle-step) * ${verticalSpacing})`,
                        "--cycle-offset-y": focusProgress.length > 1 ? "var(--cycle-step-y)" : "0px",
                        "--cycle-diameter": focusProgress.length === 1
                            ? `min(100cqmin, ${maxCycleDiameter})`
                            : `min(var(--cycle-step), ${maxCycleDiameter})`,
                        width: "calc(var(--cycle-diameter) + (var(--cycle-count) - 1) * var(--cycle-step-x))",
                        height: "calc(var(--cycle-diameter) + var(--cycle-offset-y))",
                    } as CSSProperties}
                >
                    {focusProgress.map((progress, index) => (
                        <div
                            key={index}
                            className="absolute size-[var(--cycle-diameter)]"
                            style={{
                                left: `calc(${index} * var(--cycle-step-x))`,
                                top: (index % 2 === 0) === startAtTop ? 0 : "var(--cycle-offset-y)",
                            }}
                        >
                            <CircularProgress value={progress} />
                        </div>
                    ))}
                </div>
            ) : (
                focusProgress.map((progress, index) => (
                    <CircularProgress key={index} value={progress} maxDiameter={maxCycleDiameter} />
                ))
            )}
        </div>
    );
}

export default CycleCounter;
