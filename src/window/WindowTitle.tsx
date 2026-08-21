type WindowTitleProps = {
	title: string;
};

function WindowTitle({ title }: WindowTitleProps) {
	return (
		<div
			data-tauri-drag-region
			className="
				flex
				h-full
				min-w-0
				flex-1
				items-center
				px-3
				text-sm
				font-medium
			"
		>
			{title}
		</div>
	);
}

export default WindowTitle;