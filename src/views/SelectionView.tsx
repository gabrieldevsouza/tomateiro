import TimersGrid from "../features/pomodoro/components/selectionViewer/TimersGrid";

function SelectionView() {
    return (
        <section
            className="
                bg-pink-900
                h-full w-full
                min-h-0 min-w-0
                overflow-y-auto
                overflow-x-hidden
                scrollbar-gutter-both
            "
        >
            <div
                className="
                    min-h-full
                    w-full

                    grid
                    grid-cols-[minmax(0,7fr)_minmax(0,146fr)_minmax(0,7fr)]
                    grid-rows-[7.7778vh_auto_7.7778vh]
                    [grid-template-areas:'._._.'_'._main_.'_'conf_._.']
                "
            >
                <div
                    className="
                        [grid-area:main]
                        bg-green-400
                        min-w-0
                    "
                >
                    Main
                    <TimersGrid />
                </div>

                <div
                    className="
                        [grid-area:conf]
                        bg-yellow-600
                    "
                >
                    Conf
                </div>
            </div>
        </section>
    );
}

export default SelectionView;