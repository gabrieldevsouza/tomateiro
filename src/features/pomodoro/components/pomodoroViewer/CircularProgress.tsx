type CircularProgressOrientation = "horizontal" | "vertical";

interface CircularProgressProps {
    value: number;
    showText?: boolean;
    textSize?: number;
    orientation?: CircularProgressOrientation;
}

function CircularProgress({
    value,
    showText = false,
    textSize = 36,
    orientation = "horizontal",
}: CircularProgressProps) {
    const createSlice = (
        startAngle: number,
        endAngle: number
    ) => {
        const startX =
            50 + 50 * Math.cos((startAngle * Math.PI) / 180);

        const startY =
            50 + 50 * Math.sin((startAngle * Math.PI) / 180);

        const endX =
            50 + 50 * Math.cos((endAngle * Math.PI) / 180);

        const endY =
            50 + 50 * Math.sin((endAngle * Math.PI) / 180);

        const angle = endAngle - startAngle;
        const largeArcFlag = angle > 180 ? 1 : 0;

        return `
            M 50 50
            L ${startX} ${startY}
            A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}
            Z
        `;
    };

    const progressAngle = (value / 100) * 360;

    const startAngle = -90;
    const progressEndAngle = startAngle + progressAngle;

    const sizeClassName =
        orientation === "vertical"
            ? "h-auto w-full"
            : "h-full w-auto";

    return (
        <div
            className={`
                aspect-square
                flex-none
                ${sizeClassName}
            `}
        >
            <svg
                viewBox="0 0 100 100"
                className="block size-full"
                role="img"
                aria-label={`Progresso: ${value}%`}
            >
                {/* 0% */}
                {value <= 0 && (
                    <circle
                        cx="50"
                        cy="50"
                        r="50"
                        fill="#6b7280"
                    />
                )}

                {/* Entre 0% e 100% */}
                {value > 0 && value < 100 && (
                    <>
                        {/* Progresso */}
                        <path
                            d={createSlice(
                                startAngle,
                                progressEndAngle
                            )}
                            fill="#fde047"
                        />

                        {/* Restante */}
                        <path
                            d={createSlice(
                                progressEndAngle,
                                startAngle + 360
                            )}
                            fill="#6b7280"
                        />
                    </>
                )}

                {/* 100% */}
                {value >= 100 && (
                    <circle
                        cx="50"
                        cy="50"
                        r="50"
                        fill="#fde047"
                    />
                )}

                {/* Texto */}
                {showText && (
                    <text
                        x="50"
                        y="50"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={textSize}
                    >
                        {value}%
                    </text>
                )}
            </svg>
        </div>
    );
}

export default CircularProgress;