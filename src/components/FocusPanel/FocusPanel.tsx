import FocusLabel from "../FocusLabel/FocusLabel";
import "./FocusPanel.css";

function FocusPanel() {
    return(
        <div className="FocusPanel">
            <div className="title-section">
                <FocusLabel />
            </div>
            <div className="hourglass-section"></div>
            <div className="progress-label-section"></div>
            <div className="progress-counter-section"></div>
        </div>
    )

}

export default FocusPanel;