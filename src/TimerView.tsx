import "./TimerView.css";

function TimerView() {
    return (
        <div className="timer-view">
			<div className="horizontal">
				<div className="left-section"></div>
				<div className="right-section">
                    <div className="timer-section">
                        <div className="counter-section"></div>
                        <div className="controls-section"></div>
                    </div>
                    <div className="cycles-section"></div>
                </div>
			</div>
        </div>
    );
}

export default TimerView;