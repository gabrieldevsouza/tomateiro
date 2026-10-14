export function normalizeNumberInput(value: string, min: number, max: number, previousValue = String(min)) {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min < 0 || max < min) {
        throw new RangeError("Number input limits must be non-negative integers in ascending order.");
    }
    const previousAmount = Number(previousValue);
    const fallback = /^[0-9]+$/.test(previousValue) && Number.isSafeInteger(previousAmount) && previousAmount >= min && previousAmount <= max
        ? String(previousAmount) : String(min);
    if (value === "") return min === 0 ? "0" : fallback;
    if (!/^[0-9]+$/.test(value)) return fallback;
    const amount = Number(value);
    if (!Number.isSafeInteger(amount) || amount < min || amount > max) return fallback;
    return String(amount);
}

export function normalizeTypedNumberInput(value: string, min: number, max: number, previousValue = String(min)) {
    const normalizedValue = normalizeNumberInput(value, min, max, previousValue);
    if (!/^[0-9]+$/.test(value) || Number(value) <= max) return normalizedValue;
    // Conserva o maior sufixo válido; colagem nunca passa por esta regra.
    let suffix = value.slice(-String(max).length);
    while (Number(suffix) > max) suffix = suffix.slice(1);
    return normalizeNumberInput(suffix, min, max, previousValue);
}

export function stepNumberInput(value: number, min: number, max: number, direction: 1 | -1, wrap = false) {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min < 0 || max < min) {
        throw new RangeError("Number input limits must be non-negative integers in ascending order.");
    }
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new RangeError("Number input value must be a non-negative integer.");
    }
    if (value < min) return direction > 0 ? min : value;
    const nextValue = value + direction;
    if (nextValue > max) return wrap ? min : max;
    if (nextValue < min) return wrap ? max : min;
    return nextValue;
}

export const NUMBER_INPUT_REPEAT = {
    pointerDelayMs: 500,
    touchDelayMs: 600,
    accelerationMs: 2500,
    initialStepsPerSecond: 4,
    maxStepsPerSecond: 10,
};

export function getNumberInputRepeatInterval(elapsedMs: number) {
    const progress = Number.isNaN(elapsedMs) ? 0 : Math.min(1, Math.max(0, elapsedMs / NUMBER_INPUT_REPEAT.accelerationMs));
    // Smoothstep: acelera a frequência suavemente, mantendo passos inteiros de uma unidade.
    const eased = progress * progress * (3 - 2 * progress);
    const rate = NUMBER_INPUT_REPEAT.initialStepsPerSecond
        + (NUMBER_INPUT_REPEAT.maxStepsPerSecond - NUMBER_INPUT_REPEAT.initialStepsPerSecond) * eased;
    return 1000 / rate;
}
