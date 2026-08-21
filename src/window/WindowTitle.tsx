type WindowTitleProps = {
	title: string;
};

function WindowTitle({ title }: WindowTitleProps) {
	return (
		<div
			data-tauri-drag-region
			className="
				@container
				flex
				h-full
				min-w-0
				flex-1
				items-center
				gap-2
				overflow-hidden
				px-3
				text-sm
				font-medium
			"
		>
			<img
				data-tauri-drag-region
				src="/tauri.svg"
				alt=""
				aria-hidden="true"
				draggable={false}
				className="
					h-1/2
					w-auto
					shrink-0
					object-contain
				"
			/>

			<span
				data-tauri-drag-region
				className="
					hidden
					whitespace-nowrap
					@min-[8rem]:block
				"
			>
				{title}
			</span>
		</div>
	);
}

export default WindowTitle;