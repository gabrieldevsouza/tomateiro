const TITLE_TEXT_VERTICAL_PADDING = "0.125rem";
const TITLE_TEXT_TOTAL_VERTICAL_PADDING = "0.25rem";

const TITLE_ICON_VERTICAL_MARGIN = "0.125rem";
const TITLE_ICON_TOTAL_VERTICAL_MARGIN = "0.25rem";

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
					w-auto
					shrink-0
					object-contain
				"
				style={{
					height: `calc(
						100% -
						${TITLE_ICON_TOTAL_VERTICAL_MARGIN}
					)`,
					marginBlock:
						TITLE_ICON_VERTICAL_MARGIN,
				}}
			/>

			<span
				data-tauri-drag-region
				className="
					hidden
					h-full
					items-center
					whitespace-nowrap
					@min-[8rem]:flex
				"
				style={{
					paddingBlock:
						TITLE_TEXT_VERTICAL_PADDING,
					fontSize: `clamp(
						0.5rem,
						calc(
							var(--titlebar-height) -
							${TITLE_TEXT_TOTAL_VERTICAL_PADDING}
						),
						0.875rem
					)`,
					lineHeight: 1,
				}}
			>
				{title}
			</span>
		</div>
	);
}

export default WindowTitle;