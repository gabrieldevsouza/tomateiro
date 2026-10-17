
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
    <div className="relative h-full w-full min-w-0 min-h-0">
      <div className="hover-3d h-full w-full min-w-0 min-h-0">
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
          {/* Linha 1: espaço superior */}
          <div className="row-start-1 col-start-2 h-full w-full min-h-0 min-w-0" />

          {/* Linha 2: título */}
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

          {/* Linha 3: fase */}
          <div className="row-start-3 col-start-2 h-full w-full min-h-0 min-w-0">
            <PhaseLabel phase="focus" />
          </div>

          {/* Linha 4: espaço */}
          <div className="row-start-4 col-start-2 h-full w-full min-h-0 min-w-0" />

          {/* Linha 5: contador de ciclos */}
          <div className="row-start-5 col-start-2 h-full w-full min-h-0 min-w-0">
            <CycleFraction
              completedCycles={12}
              remainingCycles={12}
            />
          </div>

          {/* Linha 6: espaço */}
          <div className="row-start-6 col-start-2 h-full w-full min-h-0 min-w-0" />

          {/* Linha 7: temporizador */}
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

          {/* Linha 8: espaço */}
          <div className="row-start-8 col-start-2 h-full w-full min-h-0 min-w-0" />

          {/* Linha 9: indicador de progresso */}
          <div className="row-start-9 col-start-2 h-full w-full min-h-0 min-w-0">
            <ProgressIndicator
              totalDurationMs={10}
              remainingMs={3}
            />
          </div>

          {/* Linha 10: espaço */}
          <div className="row-start-10 col-start-2 h-full w-full min-h-0 min-w-0" />

          {/* Linha 11: espaço inferior */}
          <div className="row-start-11 col-start-2 h-full w-full min-h-0 min-w-0" />
        </div>

        {/* Áreas de interação do hover-3d */}
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} aria-hidden="true" />
        ))}
      </div>

      {/* Botão de edição sobreposto ao card */}
      <div className="absolute right-2 top-2 z-20">
        <EditTimerButton onClick={onEdit} />
      </div>
    </div>
  );
}

export default CardSelection;
