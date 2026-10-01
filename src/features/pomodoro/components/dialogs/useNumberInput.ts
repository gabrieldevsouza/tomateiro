import { useLayoutEffect, useRef } from "react";

export function normalizeNumberInput(value: string, min: number, max: number, previousValue = String(min)) {
    if (value === "") return min === 0 ? "0" : previousValue;
    if (!/^[0-9]+$/.test(value)) return previousValue;
    const amount = Number(value);
    if (amount < min) return previousValue;
    return String(Math.min(max, amount));
}

export function useNumberInput(value: string | number, min: number, max: number) {
    const ref = useRef<HTMLInputElement>(null);
    const defaultValue = normalizeNumberInput(String(value), min, max);

    useLayoutEffect(() => {
        const input = ref.current;
        if (!input) return;
        let previousValue = normalizeNumberInput(input.value, min, max);
        input.value = previousValue;

        function invalidText(text: string) {
            return text !== "" && !/^[0-9]+$/.test(text);
        }

        function beforeInput(event: InputEvent) {
            const text = event.data ?? event.dataTransfer?.getData("text/plain") ?? "";
            if (invalidText(text)) event.preventDefault();
        }

        function paste(event: ClipboardEvent) {
            if (invalidText(event.clipboardData?.getData("text/plain") ?? "")) event.preventDefault();
        }

        function drop(event: DragEvent) {
            if (invalidText(event.dataTransfer?.getData("text/plain") ?? "")) event.preventDefault();
        }

        function normalize(event: Event) {
            const text = event instanceof InputEvent ? event.data ?? event.dataTransfer?.getData("text/plain") ?? "" : "";
            // O input number pode descartar letras antes de emitir input, com data="".
            const rejectedInsertion = event instanceof InputEvent && event.inputType.startsWith("insert") && event.data === "";
            // beforeinput pode não ser cancelável (autofill/IME); input também valida.
            const nextValue = input!.validity.badInput || invalidText(text) || rejectedInsertion
                ? previousValue
                : normalizeNumberInput(input!.value, min, max, previousValue);
            const restoreSelection = input!.value === "" || Number(input!.value) < min;
            if (input!.value !== nextValue || input!.validity.badInput) {
                input!.value = nextValue;
                if (restoreSelection) input!.select();
            }
            previousValue = nextValue;
        }

        input.addEventListener("beforeinput", beforeInput);
        input.addEventListener("paste", paste);
        input.addEventListener("drop", drop);
        input.addEventListener("input", normalize);
        input.addEventListener("change", normalize);
        input.addEventListener("blur", normalize);
        return () => {
            input.removeEventListener("beforeinput", beforeInput);
            input.removeEventListener("paste", paste);
            input.removeEventListener("drop", drop);
            input.removeEventListener("input", normalize);
            input.removeEventListener("change", normalize);
            input.removeEventListener("blur", normalize);
        };
    }, [min, max]);

    return { ref, defaultValue, min, max };
}
