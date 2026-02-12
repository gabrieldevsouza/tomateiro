import AutoFitLabel from "../AutoFitLabel/AutoFitLabel";
import "./FocusPanel.css";

function FocusPanel() {
    return(
        <div className="FocusPanel">
            <div className="title-section">
                <AutoFitLabel text="Focus" fontWeight={400} color="white" />
            </div>
            <div className="hourglass-section"></div>
            <div className="progress-label-section">
                {/*<AutoFitLabel text="Progress" />*/}
                <AutoFitLabel text="Progress" fontWeight={400} color="white" />
            </div>
            <div className="progress-counter-section">
                {/*<AutoFitLabel text= "0%" />*/}
                <AutoFitLabel text="0%" fontWeight={400} color="white" />
            </div>
        </div>
    )

}

export default FocusPanel;