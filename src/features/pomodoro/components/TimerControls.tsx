import AddMinuteButton from "./controls/AddMinuteButton";
import PictureInPictureButton from "./controls/PictureInPictureButton";
import PlayButton from "./controls/PlayButton";
import RestartCycleButton from "./controls/RestartCycleButton";
import SkipCycleButton from "./controls/SkipCycleButton";

function TimerControls() {
	return (
		<div className="

			h-full
			w-full

			grid

			grid-cols-[minmax(0,8fr)_minmax(0,59fr)_minmax(0,8fr)]
		" >

			<div className="
			

				col-start-1
				h-full
				min-h-0
				min-w-0
			" />

			<div className="

				col-start-2

				min-h-0
				min-w-0

				flex
				
				flex-row
				justify-between
			">
				<div className="

					col-start-1

					min-w-0
					min-h-0

					grid
					grid-rows-[minmax(0,9fr)_minmax(0,38fr)_minmax(0,9fr)]
					">
						<div className="

						row-start-1
						">
						</div>

						<div className="
	

						row-start-2
						flex
                		flex-row
						gap-2
                		justify-between
                		items-center
						
						">
							<AddMinuteButton />
							<RestartCycleButton />
						</div>
			
						<div className="


						row-start-3
						">
						</div>
			

				</div>
			<div className="


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

					col-start-3

					min-w-0
					min-h-0

					grid
					grid-rows-[minmax(0,9fr)_minmax(0,38fr)_minmax(0,9fr)]
					">
						<div className="
	

						row-start-1
						">
						</div>

						<div className="

						row-start-2
						
						flex
						gap-2
                		flex-row
                		justify-between
                		items-center
						">
							<SkipCycleButton />
							<PictureInPictureButton />
						</div>
			
						<div className="

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

				col-start-3
				h-full
				min-h-0
				min-w-0
			" />

		</div>
	);
}

export default TimerControls;
