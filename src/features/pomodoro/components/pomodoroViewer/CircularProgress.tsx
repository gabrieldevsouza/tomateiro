interface CircularProgressProps {
    value: number;
}

function CircularProgress({value}: CircularProgressProps){
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - value / 100);

    return (
        <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
        >
            <circle
                cx="50"
                cy="50"
                r={radius}
                fill = "none"
                stroke = "white"
                strokeWidth = "10"

            />
    

            <circle
                cx="50"
                cy="50"
                r={radius}
                fill = "none"
                stroke = "black"
                strokeWidth = "10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform= "rotate(-90 50 50)"

            />

            <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
            >
                {value}%
            </text>
        </svg>
    );
}

export default CircularProgress;