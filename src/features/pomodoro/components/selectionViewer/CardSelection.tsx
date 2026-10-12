import ProgressIndicator from "../ProgressIndicator";
import CycleCounter from "../CycleCounter";
import PhaseLabel from "../PhaseLabel";

function CardSelection() {
  const title = "WWWWWWWWWWW";

  return (
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
        <div 
          className="
            h-full
            w-full
            min-h-0
            min-w-0
            row-start-1
            col-start-2
            ">
        </div>

         <div 
          className="
            @container-size
            h-full
            w-full
            min-h-0
            min-w-0
            row-start-2
            col-start-2
            ">
              <p
						className="flex 
            h-full 
            
            justify-center
            items-center
             
            whitespace-nowrap 
            font-[Epilogue]
            font-semibold
            text-[#00CBEA] 
            leading-none"
						style={{ 
              fontSize: `min(${88 / title.length}cqw,80cqh)`,
            }}
					>
						{title}
					</p>
        </div>

        <div 
          className="
            h-full
            w-full
            min-h-0
            min-w-0
            row-start-3
            col-start-2
            ">
              <PhaseLabel phase="focus" />
        </div>

        <div 
          className="
            h-full
            w-full
            min-h-0
            min-w-0
            row-start-4
            col-start-2
            ">
             
        </div>

         <div 
          className="
            h-full
            w-full
            min-h-0
            min-w-0
            row-start-5
            col-start-2
            ">
              <CycleCounter focusProgress={[5,15,30,30,30,30,30,30,30,30,40,40]} />
        </div>

        <div 
          className="
            h-full
            w-full
            min-h-0
            min-w-0
            row-start-6
            col-start-2
            ">
        </div>

         <div 
          className="
            h-full
            w-full
            min-h-0
            min-w-0
            row-start-7
            col-start-2
            ">
              <p
						className="flex 
            h-full 
            
            justify-center
            items-center
             
            whitespace-nowrap 
            font-[Epilogue]
            text-[#00CBEA] 
            leading-none"
						style={{ 
              fontSize: "min(8cqw,40cqh)",
              transform: "translateY(0.1em)",
            }}
					>
						00:20
					</p>
              
        </div>

        <div 
          className="
            h-full
            w-full
            min-h-0
            min-w-0
            row-start-8
            col-start-2
            ">
        </div>

        <div 
          className="
            h-full
            w-full
            min-h-0
            min-w-0
            row-start-9
            col-start-2
            ">
               <ProgressIndicator
						totalDurationMs={10}
						remainingMs={3}
					/>
        </div>

        <div 
          className="
            h-full
            w-full
            min-h-0
            min-w-0
            row-start-10
            col-start-2
            ">
        </div>

        <div 
          className="
            h-full
            w-full
            min-h-0
            min-w-0
            row-start-11
            col-start-2
            ">
        </div>


    </div>

    
  );
}

export default CardSelection;
