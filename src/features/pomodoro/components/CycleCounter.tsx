import CircularProgress from "./pomodoroViewer/CircularProgress";


function CycleCounter() {
	return (
		<div className="
			h-full
			w-full

			grid

			grid-cols-[minmax(0,16fr)_minmax(0,43fr)_minmax(0,16fr)]
		" >

			<div className="

				col-start-2
				min-h-0
				min-w-0

				flex 
				flex-row
				justify-between
				items-center
			">
				<CircularProgress value={70}/>
				<CircularProgress value={30}/>
				<CircularProgress value={0}/>
				<CircularProgress value={100}/>
				
			</div>
		</div>
	);
}

export default CycleCounter;
