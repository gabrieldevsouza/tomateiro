import AddMinuteButton from "./controls/AddMinuteButton";
import PictureInPictureButton from "./controls/PictureInPictureButton";
import PlayButton from "./controls/PlayButton";
import RestartCycleButton from "./controls/RestartCycleButton";
import SkipCycleButton from "./controls/SkipCycleButton";

function TimerControls() {
	return (
		<div className="
			bg-green-500

			h-full
			w-full

			grid

			grid-cols-[minmax(0,8fr)_minmax(0,59fr)_minmax(0,8fr)]
		" >

			<div className="
				bg-fuchsia-500

				col-start-1
				h-full
				min-h-0
				min-w-0
			" />

			<div className="
				bg-blue-400

				col-start-2

				min-h-0
				min-w-0

				grid
				grid-cols-[minmax(0,22fr)_minmax(0,15fr)_minmax(0,22fr)]
			">
				<div className="
					bg-orange-400

					col-start-1

					min-w-0
					min-h-0

					grid
					grid-rows-[minmax(0,9fr)_minmax(0,38fr)_minmax(0,9fr)]
					">
						<div className="
						bg-amber-900

						row-start-1
						">
						</div>

						<div className="
						bg-red-200

						row-start-2
						 flex
                		flex-row
                		justify-between
                		items-center
						
						">
							<AddMinuteButton />
							<RestartCycleButton />
						</div>
			
						<div className="
						bg-amber-900

						row-start-3
						">
						</div>
			

				</div>
			<div className="
					bg-white

					col-start-2

					min-w-0
					min-h-0

					flex
                	items-center
					justify-center
					">
						<PlayButton />
				</div>
				<div className="
					bg-violet-600

					col-start-3

					min-w-0
					min-h-0

					grid
					grid-rows-[minmax(0,9fr)_minmax(0,38fr)_minmax(0,9fr)]
					">
						<div className="
						bg-purple-200

						row-start-1
						">
						</div>

						<div className="
						bg-blue-300

						row-start-2
						
						flex
                		flex-row
                		justify-between
                		items-center
						">
							<SkipCycleButton />
							<PictureInPictureButton />
						</div>
			
						<div className="
						bg-purple-200

						row-start-3
						">
						</div>
			
				</div>
				{/*<AddMinuteButton />
				<RestartCycleButton />
				<PlayButton />
				<SkipCycleButton />
				<PictureInPictureButton /> */}
			</div>

			<div className="
				bg-emerald-400

				col-start-3
				h-full
				min-h-0
				min-w-0
			" />

		</div>
	);
}

export default TimerControls;
