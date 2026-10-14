// Register once per document, before React mounts, so CSS and WAAPI interpolate numbers.
// Registration is document-wide even though each component owns its visual utilities.
export function registerPomodoroAnimationProperties() {
  if (typeof CSS === "undefined" || typeof CSS.registerProperty !== "function") return;

  const properties: PropertyDefinition[] = [
    { name: "--pomodoro-countdown-row", syntax: "<number>", inherits: false, initialValue: "0" },
    { name: "--pomodoro-pause-ratio", syntax: "<number>", inherits: true, initialValue: "0" },
    { name: "--pomodoro-progress-ratio", syntax: "<number>", inherits: true, initialValue: "0" },
    { name: "--pomodoro-countdown-digits", syntax: "<number>", inherits: false, initialValue: "1" },
  ];

  for (const property of properties) {
    try {
      CSS.registerProperty(property);
    } catch (error) {
      // HMR keeps the document's registry. Changed descriptors require a full reload.
      if (!(error instanceof DOMException && error.name === "InvalidModificationError")) throw error;
    }
  }
}
