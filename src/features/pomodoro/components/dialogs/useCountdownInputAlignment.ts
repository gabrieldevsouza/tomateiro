import { type RefObject, useLayoutEffect } from "react";

// The input owns its baseline and decorative countdown; its parent only owns the form.
export function useCountdownInputAlignment(
    inputRef: RefObject<HTMLInputElement | null>,
    wrapperRef: RefObject<HTMLDivElement | null>,
) {
    useLayoutEffect(() => {
        const input = inputRef.current;
        const wrapper = wrapperRef.current;
        const context = document.createElement("canvas").getContext("2d");
        if (!input || !wrapper || !context) return;
        let disposed = false;

        const alignInput = () => {
            if (disposed) return;
            const style = getComputedStyle(input);
            const fontSize = parseFloat(style.fontSize);
            if (!Number.isFinite(fontSize) || fontSize <= 0) return;
            context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            // Fixed digits keep the baseline stable when the editable value changes.
            const metrics = context.measureText("0123456789");
            const padding = metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent
                - metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
            if (!Number.isFinite(padding)) return;
            const top = `${Number(Math.max(0, padding).toFixed(3))}px`;
            const bottom = `${Number(Math.max(0, -padding).toFixed(3))}px`;
            if (input.style.paddingTop !== top) input.style.paddingTop = top;
            if (input.style.paddingBottom !== bottom) input.style.paddingBottom = bottom;
            // em keeps the overlay aligned immediately while container units resize the font.
            const offset = `${Number((padding / (2 * fontSize)).toFixed(6))}em`;
            if (wrapper.style.getPropertyValue("--pomodoro-input-offset") !== offset) {
                wrapper.style.setProperty("--pomodoro-input-offset", offset);
            }
        };

        // Font size follows this field's container, not arbitrary mutations elsewhere in the dialog.
        const resizeObserver = new ResizeObserver(alignInput);
        resizeObserver.observe(input, { box: "border-box" });
        document.fonts.addEventListener("loadingdone", alignInput);
        void document.fonts.ready.then(alignInput);
        alignInput();

        return () => {
            disposed = true;
            resizeObserver.disconnect();
            document.fonts.removeEventListener("loadingdone", alignInput);
        };
    }, [inputRef, wrapperRef]);
}
