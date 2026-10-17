import ProgressIndicator from "../ProgressIndicator";
import PhaseLabel from "../PhaseLabel";
import EditTimerButton from "../controls/EditTimerButton";
import CycleFraction from "./CycleFraction";

type CardSelectionProps = {
  onEdit: () => void;
};

function CardSelection({ onEdit }: CardSelectionProps) {
  const title = "Editar Pomodoro";

  return (
    <div className="group relative h-full w-full min-w-0 min-h-0">
      <div
        className="
          hover-3d
          h-full
          w-full
          min-w-0
          min-h-0

          perspective-[60rem]

          [--hover3d-angle:6deg]
          [--hover3d-scale:1.02]
          [--hover3d-glow:#00cbea]
          [--hover3d-glow-opacity:0.25]
          [--hover3d-blur:0.5rem]
          [--hover3d-shadow:0.25rem]
          [--hover3d-duration:350ms]
          [--ease:ease-out]

          [&>div:first-child]:[transform:rotate3d(var(--transform),0,var(--hover3d-angle))]
          [&>div:first-child]:[transition:transform_var(--ease)_var(--hover3d-duration),scale_var(--ease)_var(--hover3d-duration),outline-color_ease-out_var(--hover3d-duration)]
          [&:hover>div:first-child]:[scale:var(--hover3d-scale)]

          [&>div:first-child::before]:[background-image:radial-gradient(circle_at_50%,rgb(0_203_234_/_0.25)_10%,transparent_50%)]
          [&>div:first-child::before]:[filter:blur(var(--hover3d-blur))]

          [&:has(>div:nth-child(2):hover)]:[--transform:-0.5_0.5]
          [&:has(>div:nth-child(2):hover)]:[--shine:0%_0%]
          [&:has(>div:nth-child(2):hover)]:[--shadow:calc(var(--hover3d-shadow)*-1)_calc(var(--hover3d-shadow)*-1)]

          [&:has(>div:nth-child(3):hover)]:[--transform:-0.5_0]
          [&:has(>div:nth-child(3):hover)]:[--shine:100%_0%]
          [&:has(>div:nth-child(3):hover)]:[--shadow:0rem_calc(var(--hover3d-shadow)*-1)]

          [&:has(>div:nth-child(4):hover)]:[--transform:-0.5_-0.5]
          [&:has(>div:nth-child(4):hover)]:[--shine:200%_0%]
          [&:has(>div:nth-child(4):hover)]:[--shadow:var(--hover3d-shadow)_calc(var(--hover3d-shadow)*-1)]

          [&:has(>div:nth-child(5):hover)]:[--transform:0_0.5]
          [&:has(>div:nth-child(5):hover)]:[--shine:0%_100%]
          [&:has(>div:nth-child(5):hover)]:[--shadow:calc(var(--hover3d-shadow)*-1)_0rem]

          [&:has(>div:nth-child(6):hover)]:[--transform:0_-0.5]
          [&:has(>div:nth-child(6):hover)]:[--shine:200%_100%]
          [&:has(>div:nth-child(6):hover)]:[--shadow:var(--hover3d-shadow)_0rem]

          [&:has(>div:nth-child(7):hover)]:[--transform:0.5_0.5]
          [&:has(>div:nth-child(7):hover)]:[--shine:0%_200%]
          [&:has(>div:nth-child(7):hover)]:[--shadow:calc(var(--hover3d-shadow)*-1)_var(--hover3d-shadow)]

          [&:has(>div:nth-child(8):hover)]:[--transform:0.5_0]
          [&:has(>div:nth-child(8):hover)]:[--shine:100%_200%]
          [&:has(>div:nth-child(8):hover)]:[--shadow:0rem_var(--hover3d-shadow)]

          [&:has(>div:nth-child(9):hover)]:[--transform:0.5_-0.5]
          [&:has(>div:nth-child(9):hover)]:[--shine:200%_200%]
          [&:has(>div:nth-child(9):hover)]:[--shadow:var(--hover3d-shadow)_var(--hover3d-shadow)]
        "
      >
        <div
          className="
            card
            shadow-sm
            h-full
            w-full
            outline-[#151E38]
            outline-1
            outline-offset-0
            min-w-0
            min-h-0
            grid
            grid-rows-[minmax(0,7fr)_minmax(0,18fr)_minmax(0,7fr)_minmax(0,9fr)_minmax(0,24fr)_minmax(0,11fr)_minmax(0,26fr)_minmax(0,10fr)_minmax(0,10fr)_minmax(0,8fr)_minmax(0,7fr)]
            grid-cols-[minmax(0,7fr)_minmax(0,102fr)_minmax(0,7fr)]
          "
        >
          <div className="row-start-1 col-start-2 h-full w-full min-h-0 min-w-0" />

          <div
            className="
              @container-size
              row-start-2
              col-start-1
              h-full
              w-full
              min-h-0
              min-w-0
              pl-3
            "
          >
            <p
              className="
                flex
                h-full
                w-full
                items-center
                justify-start
                whitespace-nowrap
                font-[Epilogue]
                font-semibold
                text-[#00CBEA]
                leading-none
              "
              style={{
                fontSize: "100cqh",
                transform: `scaleX(${Math.min(
                  1,
                  6.3 / (title.length * 0.9)
                )})`,
              }}
            >
              {title}
            </p>
          </div>

          <div className="row-start-3 col-start-2 h-full w-full min-h-0 min-w-0">
            <PhaseLabel phase="focus" />
          </div>

          <div className="row-start-4 col-start-2 h-full w-full min-h-0 min-w-0" />

          <div className="row-start-5 col-start-2 h-full w-full min-h-0 min-w-0">
            <CycleFraction
              completedCycles={12}
              remainingCycles={12}
            />
          </div>

          <div className="row-start-6 col-start-2 h-full w-full min-h-0 min-w-0" />

          <div className="row-start-7 col-start-2 h-full w-full min-h-0 min-w-0">
            <p
              className="
                flex
                h-full
                justify-center
                items-center
                whitespace-nowrap
                font-[Epilogue]
                text-[#00CBEA]
                leading-none
              "
              style={{
                fontSize: "min(8cqw,40cqh)",
                transform: "translateY(0.1em)",
              }}
            >
              00:20
            </p>
          </div>

          <div className="row-start-8 col-start-2 h-full w-full min-h-0 min-w-0" />

          <div className="row-start-9 col-start-2 h-full w-full min-h-0 min-w-0">
            <ProgressIndicator
              totalDurationMs={10}
              remainingMs={3}
            />
          </div>

          <div className="row-start-10 col-start-2 h-full w-full min-h-0 min-w-0" />

          <div className="row-start-11 col-start-2 h-full w-full min-h-0 min-w-0" />
        </div>

        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} aria-hidden="true" />
        ))}
      </div>

      <div
        className="
          absolute
          right-2
          top-2
          z-20
          opacity-0
          pointer-events-none
          transition-opacity
          duration-200
          group-hover:opacity-100
          group-hover:pointer-events-auto
          group-focus-within:opacity-100
          group-focus-within:pointer-events-auto
        "
      >
        <EditTimerButton
          onClick={onEdit}
          sizeClassName="!size-8"
        />
      </div>
    </div>
  );
}

export default CardSelection;