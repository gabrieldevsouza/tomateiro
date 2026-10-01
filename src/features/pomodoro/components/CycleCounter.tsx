import CircularProgress from "./pomodoroViewer/CircularProgress";
import type { CSSProperties } from "react";

type CycleCounterProps = {
    focusProgress: number[];
};

function CycleCounter({ focusProgress }: CycleCounterProps) {
    // A partir desta quantidade, os medidores usam o zigzag.
    const minCyclesForZigzag = 6;
    // Teto do diâmetro: use um comprimento CSS, como "48px" ou "70cqmin".
    const maxCycleDiameter = "35cqmin";
    // true aproveita os dois eixos; false usa os espaçamentos manuais abaixo.
    const fitZigzagToCell = true;
    // No modo manual, 1 = passo original; 0.8 = 20% mais perto.
    const horizontalSpacing = .8;
    const verticalSpacing = .1;
    // true começa em cima; false começa embaixo.
    const startAtTop = false;
    const isZigzag = focusProgress.length >= minCyclesForZigzag;
    const cycleCount = Math.max(1, focusProgress.length);
    const stepCount = cycleCount - 1;
    const isAutoZigzag = fitZigzagToCell && cycleCount > 1;
    const alignment = isZigzag || focusProgress.length === 1 ? "justify-center" : "justify-between";
    // O diâmetro pode superar o passo, até os círculos vizinhos se encostarem.
    const diameterToStepLimit = focusProgress.length > 2
        ? Math.min(horizontalSpacing * 2, Math.hypot(horizontalSpacing, verticalSpacing))
        : Math.hypot(horizontalSpacing, verticalSpacing);

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
                        "--cycle-count": cycleCount,
                        "--cycle-aspect-ratio": "tan(atan2(100cqw, 100cqh))",
                        // Raiz do limite diagonal, racionalizada para evitar perda de precisão.
                        // Com r = largura/altura e m = passos: H(r²+m²)/(r+m²+m√(2r+m²−1)).
                        "--cycle-diagonal-limit": isAutoZigzag
                            ? `calc(100cqh *
                                (var(--cycle-aspect-ratio) * var(--cycle-aspect-ratio) + ${stepCount * stepCount}) /
                                (var(--cycle-aspect-ratio) + ${stepCount * stepCount} + ${stepCount} *
                                    sqrt(2 * var(--cycle-aspect-ratio) + ${stepCount * stepCount - 1}))
                            )`
                            : "100cqmin",
                        "--cycle-step-x": isAutoZigzag
                            ? `calc((100cqw - var(--cycle-diameter)) / ${stepCount})`
                            : `calc(var(--cycle-step) * ${horizontalSpacing})`,
                        "--cycle-step-y": isAutoZigzag
                            ? "calc(100cqh - var(--cycle-diameter))"
                            : `calc(var(--cycle-step) * ${verticalSpacing})`,
                        "--cycle-offset-y": focusProgress.length > 1 ? "var(--cycle-step-y)" : "0px",
                        "--cycle-diameter": focusProgress.length === 1
                            ? `min(100cqmin, ${maxCycleDiameter})`
                            : isAutoZigzag
                                ? `min(
                                    ${maxCycleDiameter},
                                    100cqmin,
                                    ${cycleCount > 2 ? `calc(200cqw / ${cycleCount + 1})` : "100cqw"},
                                    var(--cycle-diagonal-limit)
                                )`
                                : `max(0px, min(
                                    ${maxCycleDiameter},
                                    calc(100cqw - (var(--cycle-count) - 1) * var(--cycle-step-x)),
                                    calc(100cqh - var(--cycle-offset-y)),
                                    calc(var(--cycle-step) * ${diameterToStepLimit})
                                ))`,
                        width: isAutoZigzag ? "100cqw" : "calc(var(--cycle-diameter) + (var(--cycle-count) - 1) * var(--cycle-step-x))",
                        height: isAutoZigzag ? "100cqh" : "calc(var(--cycle-diameter) + var(--cycle-offset-y))",
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
