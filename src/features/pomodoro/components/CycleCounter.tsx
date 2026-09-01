import CircularProgress from "./pomodoroViewer/CircularProgress";


function CycleCounter() {
	return (
		<div className="
			bg-green-500

			h-full
			w-full

			grid

			grid-cols-[minmax(0,16fr)_minmax(0,43fr)_minmax(0,16fr)]
		" >

			<div className="
				bg-fuchsia-500

				col-start-1
				min-h-0
				min-w-0
			"/>

			<div className="
				bg-blue-400

				col-start-2
				min-h-0
				min-w-0

				grid
				grid-cols-4
			">
				<div className="
					bg-[#212940]
					col-start-1
					min-h-0
					min-w-0
					h-full
					w-full
				">
					<div className="
						min-w-0 
						min-h-0
						w-full
						h-full
					">
						<CircularProgress value={70}/>
					</div>
				</div>
				<div className="
					bg-[#212940]
					col-start-2
					min-h-0
					min-w-0
					h-full
					w-full
				">
					<CircularProgress value={30}/>
				</div>

				<div className="
					bg-[#212940]
					col-start-3
					min-h-0
					min-w-0
					h-full
					w-full
				">
					<CircularProgress value={100}/>
				</div>

				<div className="
					bg-[#212940]
					col-start-4
					min-h-0
					min-w-0
					h-full
					w-full
				">
					<CircularProgress value={0}/>
				</div>
			</div>

			<div className="
				bg-emerald-400

				col-start-3
				min-h-0
				min-w-0
			"/>

		</div>
	);
}

export default CycleCounter;
