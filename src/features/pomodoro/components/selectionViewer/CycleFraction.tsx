
type CycleFractionProps = {
  completedCycles: number;
  remainingCycles: number;
};

function CycleFraction({
  completedCycles,
  remainingCycles,
}: CycleFractionProps) {
  return (
    <div className="flex h-full w-full min-h-0 min-w-0 items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="block h-full max-h-full w-auto max-w-full"
        role="img"
        aria-label={`${completedCycles} ciclos concluídos e ${remainingCycles} restantes`}
      >
        <defs>
          <clipPath id="cycle-fraction-clip">
            <circle cx="50" cy="50" r="48" />
          </clipPath>
        </defs>

        <g clipPath="url(#cycle-fraction-clip)">
          <rect x="0" y="0" width="100" height="100" fill="#6B6B79" />
          <path
            d="M 60 0 L 100 0 L 100 100 L 40 100 Z"
            fill="#FFE66B"
          />
        </g>

        <text
          x="25"
          y="51"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="40"
          fill="#242B49"
        >
          {completedCycles}
        </text>

        <text
          x="72"
          y="51"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="40"
          fill="#D97A17"
        >
          {remainingCycles}
        </text>
      </svg>
    </div>
  );
}

export default CycleFraction;
