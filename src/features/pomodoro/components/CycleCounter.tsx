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
					bg-white
					col-start-1
					min-h-0
					min-w-0
					h-full
					w-full
				">
					<div 
						className="
							radial-progress
						" 
						style={{ "--value": 70 } as React.CSSProperties } 
						aria-valuenow={70}
						role="progressbar"
					>
						70%
					</div>
				</div>
				<div className="
					bg-pink-200
					col-start-2
					min-h-0
					min-w-0
					h-full
					w-full
				"/>

				<div className="
					bg-white
					col-start-3
					min-h-0
					min-w-0
					h-full
					w-full
				"/>
				<div className="
					bg-pink-200
					col-start-4
					min-h-0
					min-w-0
					h-full
					w-full
				"/>
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
