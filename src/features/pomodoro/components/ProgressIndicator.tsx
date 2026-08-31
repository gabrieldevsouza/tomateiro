function ProgressIndicator() {
	return (
		<div className="
			bg-green-500

			h-full
			w-full

			grid

			grid-cols-[minmax(0,1fr)]
		" >

			<div className="
				bg-fuchsia-500

				col-start-1
				min-h-0
				min-w-0
			"/>

		</div>
	);
}

export default ProgressIndicator;
