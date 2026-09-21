import CardSelection from "../features/pomodoro/components/selectionViewer/CardSelection";
import TimersGrid from "../features/pomodoro/components/selectionViewer/TimersGrid";


function SelectionView() {
    return (
        <section
            className="
                bg-pink-900

                h-full
                w-full

                grid

                grid-cols-[minmax(0,7fr)_minmax(0,146fr)_minmax(0,7fr)]
                grid-rows-[minmax(0,7fr)_minmax(0,76fr)_minmax(0,7fr)]
                
                [grid-template-areas:'._._.'_'._main_.'_'conf_._.']
            "
        >
        <div className="
            [grid-area:main]
            bg-green-400
        ">
            Main
            <TimersGrid />
        </div>

        <div className="
            [grid-area:conf]
            bg-yellow-600
        ">
            Conf
        </div>



        </section>
    );
}

export default SelectionView