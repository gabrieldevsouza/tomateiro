import CardSelection from "../features/pomodoro/components/selectionViewer/CardSelection";


function SelectionView() {
    return (
        <section
            className="
                bg-pink-900
                grid
                h-full
                w-full
                grid-cols-[minmax(0,7fr)_minmax(0,146fr)_minmax(0,7fr)]
                grid-rows-[minmax(0,7fr)_minmax(0,76fr)_minmax(0,7fr)]
            "

        >
            <div
                className="
                    
                    bg-blue-400

                    col-2
                    row-2

                    h-full
                    w-full
                    min-w-0
                    min-h-0

                    flex
                    flex-wrap
                    gap-2
                
            ">
                <CardSelection/>
                <CardSelection/>
                <CardSelection/>
                <CardSelection/>
               
            </div>
        </section>
    );
}

export default SelectionView