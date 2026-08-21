import TimerView from "./TimerView";
import CustomTitlebar from "./window/CustomTitlebar";

function App() {
	return (
		<div
		data-theme="light"
		className="
			relative
			h-screen
			w-screen
			overflow-hidden
			bg-white
		">
			<CustomTitlebar />
			
			<main className="
				h-full
				w-full
				overflow-hidden
			">

				<TimerView />
			</main>
		</div>
	);
}

export default App;
