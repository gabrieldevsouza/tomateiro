import { useLayoutEffect, useRef } from "react";

export function normalizeNumberInput(value: string, min: number, max: number, previousValue = String(min)) {
    if (value === "") return min === 0 ? "0" : previousValue;
    if (!/^[0-9]+$/.test(value)) return previousValue;
    const amount = Number(value);
    if (amount < min) return previousValue;
    return String(Math.min(max, amount));
}

type NumberInputOptions = { allowZeroWhileEditing?: boolean };

export function useNumberInput(value: string | number, min: number, max: number, { allowZeroWhileEditing = false }: NumberInputOptions = {}) {
    const ref = useRef<HTMLInputElement>(null);
    const defaultValue = normalizeNumberInput(String(value), min, max);
    const previousValue = useRef(defaultValue);
    const effectiveValue = useRef(Number(defaultValue));

    function write(displayValue: string) {
        previousValue.current = displayValue;
        effectiveValue.current = Math.min(max, Math.max(min, Number(displayValue)));
        const input = ref.current;
        if (input && (input.value !== displayValue || input.validity.badInput)) input.value = displayValue;
    }

    function step(direction: 1 | -1) {
        const input = ref.current;
        if (!input) return;
        input.focus({ preventScroll: true });
        if (direction > 0) input.stepUp();
        else if (!(allowZeroWhileEditing && input.value === "0")) input.stepDown();
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.select();
    }

    useLayoutEffect(() => {
        const input = ref.current;
        if (!input) return;
        write(normalizeNumberInput(input.value, min, max));

        function invalidText(text: string) {
            return text !== "" && !/^[0-9]+$/.test(text);
        }

        function invalidTransfer(text: string) {
            return !/^[0-9]+$/.test(text) || Number(text) < min;
        }

        function beforeInput(event: InputEvent) {
            const text = event.data ?? event.dataTransfer?.getData("text/plain") ?? "";
            const transfer = event.inputType === "insertFromPaste" || event.inputType === "insertFromDrop";
            if (invalidText(text) || (transfer && text !== "" && invalidTransfer(text))) event.preventDefault();
        }

        function paste(event: ClipboardEvent) {
            if (invalidTransfer(event.clipboardData?.getData("text/plain") ?? "")) event.preventDefault();
        }

        function drop(event: DragEvent) {
            if (invalidTransfer(event.dataTransfer?.getData("text/plain") ?? "")) event.preventDefault();
        }

        function mouseDown(event: MouseEvent) {
            if (event.button !== 0) return;
            // O foco destaca a caixa; o mouse não deve criar uma seleção parcial.
            event.preventDefault();
            input!.focus({ preventScroll: true });
            input!.select();
        }

        function copy(event: ClipboardEvent) {
            event.preventDefault();
            event.clipboardData?.setData("text/plain", input!.value);
        }

        function cut(event: ClipboardEvent) {
            copy(event);
            write(String(min));
            input!.dispatchEvent(new Event("input", { bubbles: true }));
            input!.select();
        }

        function keyDown(event: KeyboardEvent) {
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
            event.preventDefault();
            step(event.key === "ArrowUp" ? 1 : -1);
        }

        function normalize(event: Event) {
            const edit = event instanceof InputEvent ? event : null;
            const text = edit?.data ?? edit?.dataTransfer?.getData("text/plain") ?? "";
            const transfer = edit?.inputType === "insertFromPaste" || edit?.inputType === "insertFromDrop";
            const fromCut = edit?.inputType === "deleteByCut";
            const editing = allowZeroWhileEditing && document.activeElement === input && event.type !== "blur";
            // O input number pode descartar letras antes de emitir input, com data="".
            const rejectedInsertion = edit?.inputType.startsWith("insert") && edit.data === "";
            // beforeinput pode não ser cancelável (autofill/IME); input também valida.
            let nextValue = input!.validity.badInput || invalidText(text) || rejectedInsertion || (transfer && invalidTransfer(text || input!.value))
                ? previousValue.current
                : normalizeNumberInput(input!.value, editing ? 0 : min, max, previousValue.current);
            if (fromCut && allowZeroWhileEditing) nextValue = String(min);
            if (!editing) nextValue = String(Math.max(min, Number(nextValue)));
            const restoreSelection = input!.value === "";
            write(nextValue);
            if (restoreSelection && document.activeElement === input) input!.select();
        }

        input.addEventListener("beforeinput", beforeInput);
        input.addEventListener("paste", paste);
        input.addEventListener("drop", drop);
        input.addEventListener("mousedown", mouseDown);
        input.addEventListener("copy", copy);
        input.addEventListener("cut", cut);
        input.addEventListener("keydown", keyDown);
        input.addEventListener("input", normalize);
        input.addEventListener("change", normalize);
        input.addEventListener("blur", normalize);
        return () => {
            input.removeEventListener("beforeinput", beforeInput);
            input.removeEventListener("paste", paste);
            input.removeEventListener("drop", drop);
            input.removeEventListener("mousedown", mouseDown);
            input.removeEventListener("copy", copy);
            input.removeEventListener("cut", cut);
            input.removeEventListener("keydown", keyDown);
            input.removeEventListener("input", normalize);
            input.removeEventListener("change", normalize);
            input.removeEventListener("blur", normalize);
        };
    }, [min, max, allowZeroWhileEditing]);

    return { inputProps: { ref, defaultValue, min, max }, getValue: () => effectiveValue.current, step };
}
