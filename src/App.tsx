import TimerView from "./TimerView";
import CustomTitlebar from "./window/CustomTitlebar";

function App() {
	return (
		<div
		data-theme="light"
		className="
			flex
			h-screen
			w-screen
			flex-col
			overflow-hidden
			bg-white
		">
			<CustomTitlebar />
			
			<main className="
				h-screen
				w-screen
				overflow-hidden
			">

				<TimerView />
			</main>
		</div>
	);
}

export default App;
