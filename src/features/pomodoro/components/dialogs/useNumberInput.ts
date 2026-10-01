import { useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";

export function normalizeNumberInput(value: string, min: number, max: number, previousValue = String(min)) {
    if (value === "") return min === 0 ? "0" : previousValue;
    if (!/^[0-9]+$/.test(value)) return previousValue;
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < min || amount > max) return previousValue;
    return String(amount);
}

export function normalizeTypedNumberInput(value: string, min: number, max: number, previousValue = String(min)) {
    if (!/^[0-9]+$/.test(value) || Number(value) <= max) return normalizeNumberInput(value, min, max, previousValue);
    // Conserva o maior sufixo válido; colagem nunca passa por esta regra.
    let suffix = value.slice(-String(max).length);
    while (Number(suffix) > max) suffix = suffix.slice(1);
    return normalizeNumberInput(suffix, min, max, previousValue);
}

export function stepNumberInput(value: number, min: number, max: number, direction: 1 | -1, wrap = false) {
    if (value < min) return direction > 0 ? min : value;
    const nextValue = value + direction;
    if (nextValue > max) return wrap ? min : max;
    if (nextValue < min) return wrap ? max : min;
    return nextValue;
}

const NUMBER_INPUT_REPEAT = {
    pointerDelayMs: 500,
    touchDelayMs: 600,
    accelerationMs: 2500,
    initialStepsPerSecond: 4,
    maxStepsPerSecond: 10,
};

export function getNumberInputRepeatInterval(elapsedMs: number) {
    const progress = Math.min(1, Math.max(0, elapsedMs / NUMBER_INPUT_REPEAT.accelerationMs));
    // Smoothstep: acelera a frequência suavemente, mantendo passos inteiros de uma unidade.
    const eased = progress * progress * (3 - 2 * progress);
    const rate = NUMBER_INPUT_REPEAT.initialStepsPerSecond
        + (NUMBER_INPUT_REPEAT.maxStepsPerSecond - NUMBER_INPUT_REPEAT.initialStepsPerSecond) * eased;
    return 1000 / rate;
}

type NumberInputPress = {
    button: HTMLButtonElement;
    pointerId: number;
    initialValue: string;
    direction: 1 | -1;
    repeated: boolean;
    repeatStartedAt?: number;
    timer?: ReturnType<typeof setTimeout>;
};

type NumberInputOptions = {
    allowZeroWhileEditing?: boolean;
    wrap?: boolean;
    onInputFeedback?: (message: string | null) => void;
};

export function useNumberInput(value: string | number, min: number, max: number, { allowZeroWhileEditing = false, wrap = false, onInputFeedback }: NumberInputOptions = {}) {
    const ref = useRef<HTMLInputElement>(null);
    const defaultValue = normalizeNumberInput(String(value), min, max);
    const [display, setDisplay] = useState({ value: defaultValue, durationMs: getNumberInputRepeatInterval(0) });
    const previousValue = useRef(defaultValue);
    const effectiveValue = useRef(Number(defaultValue));
    const feedback = useRef(onInputFeedback);
    const press = useRef<NumberInputPress | null>(null);
    const suppressedClick = useRef<HTMLButtonElement | null>(null);
    useLayoutEffect(() => { feedback.current = onInputFeedback; }, [onInputFeedback]);

    function write(displayValue: string) {
        previousValue.current = displayValue;
        effectiveValue.current = Math.min(max, Math.max(min, Number(displayValue)));
        const input = ref.current;
        if (input && (input.value !== displayValue || input.validity.badInput)) input.value = displayValue;
        const elapsed = press.current?.repeatStartedAt;
        const durationMs = getNumberInputRepeatInterval(elapsed === undefined ? 0 : performance.now() - elapsed);
        // Espelha o valor já validado sem controlar o input nem alterar a cadência dos passos.
        setDisplay(current => current.value === displayValue ? current : { value: displayValue, durationMs });
    }

    function step(direction: 1 | -1) {
        const input = ref.current;
        if (!input) return false;
        const initialValue = input.value;
        input.focus({ preventScroll: true });
        write(String(stepNumberInput(Number(input.value), min, max, direction, wrap)));
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.select();
        return input.value !== initialValue;
    }

    function stopPress(restore = false, suppressClick = false) {
        const active = press.current;
        if (!active) return;
        press.current = null;
        clearTimeout(active.timer);
        if (active.repeated || restore || suppressClick) suppressedClick.current = active.button;
        const input = ref.current;
        if (restore && input) {
            const editingMin = allowZeroWhileEditing && document.activeElement === input ? 0 : min;
            const restoredValue = normalizeNumberInput(active.initialValue, editingMin, max);
            if (input.value !== restoredValue) {
                write(restoredValue);
                input.dispatchEvent(new Event("input", { bubbles: true }));
            }
            if (document.activeElement === input) input.select();
        }
        if (active.button.hasPointerCapture(active.pointerId)) active.button.releasePointerCapture(active.pointerId);
    }

    function pointerInside(active: NumberInputPress, event: { clientX: number; clientY: number }) {
        const bounds = active.button.getBoundingClientRect();
        return event.clientX >= bounds.left && event.clientX < bounds.right
            && event.clientY >= bounds.top && event.clientY < bounds.bottom;
    }

    function repeatStep(active: NumberInputPress) {
        if (press.current !== active) return;
        if (!active.button.isConnected || !ref.current?.isConnected) {
            stopPress();
            return;
        }
        active.repeatStartedAt ??= performance.now();
        active.repeated = true;
        const changed = step(active.direction);
        // Não acumula passos atrasados nem mantém um timer no limite dos ciclos.
        if (press.current === active && changed) {
            active.timer = setTimeout(() => repeatStep(active), getNumberInputRepeatInterval(performance.now() - active.repeatStartedAt));
        }
    }

    function getStepButtonProps(direction: 1 | -1) {
        return {
            onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
                if (event.button !== 0 || !event.isPrimary || press.current) return;
                event.preventDefault();
                const input = ref.current;
                if (!input) return;
                input.focus({ preventScroll: true });
                input.select();
                suppressedClick.current = null;
                const active: NumberInputPress = {
                    button: event.currentTarget,
                    pointerId: event.pointerId,
                    initialValue: input.value,
                    direction,
                    repeated: false,
                };
                press.current = active;
                try { active.button.setPointerCapture(active.pointerId); } catch { /* Eventos sintéticos não possuem um ponteiro ativo. */ }
                const delay = event.pointerType === "touch" ? NUMBER_INPUT_REPEAT.touchDelayMs : NUMBER_INPUT_REPEAT.pointerDelayMs;
                active.timer = setTimeout(() => repeatStep(active), delay);
            },
            onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
                const active = press.current;
                // Com captura, pointerleave pode não ocorrer; as coordenadas continuam disponíveis.
                if (active?.pointerId === event.pointerId && !pointerInside(active, event)) stopPress(true);
            },
            onPointerLeave(event: ReactPointerEvent<HTMLButtonElement>) {
                if (press.current?.pointerId === event.pointerId) stopPress(true);
            },
            onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
                const active = press.current;
                if (active?.pointerId === event.pointerId) stopPress(!pointerInside(active, event));
            },
            onPointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
                if (press.current?.pointerId === event.pointerId) stopPress(true);
            },
            onLostPointerCapture(event: ReactPointerEvent<HTMLButtonElement>) {
                if (press.current?.pointerId === event.pointerId) stopPress(true);
            },
            onContextMenu(event: ReactMouseEvent<HTMLButtonElement>) {
                if (press.current?.button === event.currentTarget) event.preventDefault();
            },
            onClick(event: ReactMouseEvent<HTMLButtonElement>) {
                stopPress(false, event.detail === 0);
                const suppressed = suppressedClick.current === event.currentTarget && event.detail > 0;
                if (event.detail > 0) suppressedClick.current = null;
                if (suppressed) event.preventDefault();
                else step(direction);
            },
        };
    }

    useLayoutEffect(() => {
        const input = ref.current;
        if (!input) return;
        write(normalizeNumberInput(input.value, min, max));

        function invalidText(text: string) {
            return text !== "" && !/^[0-9]+$/.test(text);
        }

        function invalidTransfer(text: string) {
            const amount = Number(text);
            return !/^[0-9]+$/.test(text) || !Number.isFinite(amount) || amount < min || amount > max;
        }

        function rejectTransfer() {
            const label = input!.getAttribute("aria-label")?.replace(/:\s*/g, ", ") ?? "Este campo";
            feedback.current?.(`${label}: use um número inteiro entre ${min} e ${max}. O valor anterior foi mantido.`);
        }

        function transferValue(event: ClipboardEvent | DragEvent, text: string, inputType: string) {
            stopPress(false, true);
            event.preventDefault();
            if (invalidTransfer(text)) {
                rejectTransfer();
                return;
            }
            input!.focus({ preventScroll: true });
            write(String(Number(text)));
            input!.dispatchEvent(new InputEvent("input", { inputType, data: text, bubbles: true }));
            input!.select();
        }

        function beforeInput(event: InputEvent) {
            stopPress(false, true);
            const text = event.data ?? event.dataTransfer?.getData("text/plain") ?? "";
            const transfer = event.inputType === "insertFromPaste" || event.inputType === "insertFromDrop";
            if (transfer && text !== "" && invalidTransfer(text)) {
                event.preventDefault();
                if (event.cancelable) rejectTransfer();
            } else if (invalidText(text)) event.preventDefault();
        }

        function paste(event: ClipboardEvent) {
            transferValue(event, event.clipboardData?.getData("text/plain") ?? "", "insertFromPaste");
        }

        function drop(event: DragEvent) {
            transferValue(event, event.dataTransfer?.getData("text/plain") ?? "", "insertFromDrop");
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
            stopPress(false, true);
            copy(event);
            write(String(min));
            input!.dispatchEvent(new Event("input", { bubbles: true }));
            input!.select();
        }

        function keyDown(event: KeyboardEvent) {
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
            stopPress(false, true);
            event.preventDefault();
            step(event.key === "ArrowUp" ? 1 : -1);
        }

        function normalize(event: Event) {
            const edit = event instanceof InputEvent ? event : null;
            if (event.type === "blur") stopPress(true);
            // change pode preceder blur; só uma nova edição deve interromper sem restaurar.
            else if (edit || (event.type === "change" && input!.value !== previousValue.current)) stopPress(false, true);
            const text = edit?.data ?? edit?.dataTransfer?.getData("text/plain") ?? "";
            const transfer = edit?.inputType === "insertFromPaste" || edit?.inputType === "insertFromDrop";
            const fromCut = edit?.inputType === "deleteByCut";
            const typing = edit?.inputType === "insertText" || edit?.inputType === "insertCompositionText";
            const editing = allowZeroWhileEditing && document.activeElement === input && event.type !== "blur";
            // O input number pode descartar letras antes de emitir input, com data="".
            const rejectedInsertion = edit?.inputType.startsWith("insert") && edit.data === "";
            // beforeinput pode não ser cancelável (autofill/IME); input também valida.
            const rejectedTransfer = transfer && invalidTransfer(text || input!.value);
            const rejected = (!transfer && input!.validity.badInput) || invalidText(text) || rejectedInsertion || rejectedTransfer;
            let nextValue = rejected
                ? previousValue.current
                : transfer ? String(Number(text || input!.value))
                : (typing ? normalizeTypedNumberInput : normalizeNumberInput)(input!.value, editing ? 0 : min, max, previousValue.current);
            if (fromCut && allowZeroWhileEditing) nextValue = String(min);
            if (!editing) nextValue = String(Math.max(min, Number(nextValue)));
            const restoreSelection = input!.value === "";
            write(nextValue);
            if (rejectedTransfer) rejectTransfer();
            else if (!rejected && event.type === "input") feedback.current?.(null);
            if (restoreSelection && document.activeElement === input) input!.select();
        }

        function cancelPress() { stopPress(true); }
        function visibilityChange() { if (document.hidden) cancelPress(); }
        function cancelKey(event: KeyboardEvent) {
            if (event.key !== "Escape" || !press.current) return;
            event.preventDefault();
            cancelPress();
        }
        function pointerEnd(event: PointerEvent) {
            const active = press.current;
            if (active?.pointerId === event.pointerId) stopPress(event.type === "pointercancel" || !pointerInside(active, event));
        }

        window.addEventListener("blur", cancelPress);
        window.addEventListener("keydown", cancelKey, true);
        window.addEventListener("pointerup", pointerEnd);
        window.addEventListener("pointercancel", pointerEnd);
        document.addEventListener("visibilitychange", visibilityChange);
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
            stopPress();
            suppressedClick.current = null;
            window.removeEventListener("blur", cancelPress);
            window.removeEventListener("keydown", cancelKey, true);
            window.removeEventListener("pointerup", pointerEnd);
            window.removeEventListener("pointercancel", pointerEnd);
            document.removeEventListener("visibilitychange", visibilityChange);
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
    }, [min, max, allowZeroWhileEditing, wrap]);

    return { inputProps: { ref, defaultValue, min, max }, displayValue: display.value, transitionMs: display.durationMs, getValue: () => effectiveValue.current, step, getStepButtonProps };
}
