function TimerView() {
	return (
		<section
			className="
				flex
				h-full
				w-full
				items-center
				justify-center
				bg-orange-300
				text-orange-950
				[container-type:size]
			"
		>
			<div
				className="
					flex
					aspect-[8/9]
					w-[min(100cqw,88.8889cqh)]
					flex-col
					items-center
					justify-center
					bg-red-400
					text-center
					text-orange-950
				"
			/>
		</section>
	);
}

export default TimerView;