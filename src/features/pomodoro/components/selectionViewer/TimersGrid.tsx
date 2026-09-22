import CardSelection from "./CardSelection";
import AddCardSelection from "./AddCardSelection";

type TimersGridProps = {
  timers?: ReadonlyArray<{ id: string | number }>;
};

// Dados apenas para visualizar o layout com <TimersGrid />.
const exampleTimers = Array.from({ length: 7 }, (_, index) => ({
  id: `example-${index + 1}`,
}));

export default function TimersGrid({
  timers = exampleTimers,
}: TimersGridProps) {
  return (
    <section
      aria-label="Temporizadores"
      className="
        grid 
        w-full 
        min-w-0
        content-start 
        gap-3 
        p-3
        auto-rows-68
        grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))]
      "
    >
      {timers.map((timer) => (
        <div
          key={timer.id}
          className="min-w-0 min-h-0"
        >
          <CardSelection />
        </div>
      ))}

      <div className="min-w-0 min-h-0">
        <AddCardSelection />
      </div>
    </section>
  );
}