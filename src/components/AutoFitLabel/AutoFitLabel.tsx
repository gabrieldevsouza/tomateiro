import "./AutoFitLabel.css";
import React from "react";

interface AutoFitLabelProps {
  text?: string;
  fontWeight?: number;
  color?: React.CSSProperties["color"];
}

function AutoFitLabel({ text = "Text", fontWeight = 500, color = "white" }: AutoFitLabelProps) {
  return (
    <div className="AutoFitLabel">
      <span style={{fontWeight, color}}>{text}</span> 
    </div>
  );
}

export default AutoFitLabel;
