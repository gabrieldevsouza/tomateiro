import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { Children, type ComponentProps, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { clearMocks, mockIPC, mockWindows } from "@tauri-apps/api/mocks";
import AppShell from "../src/layout/AppShell";
import WindowControlButton from "../src/window/WindowControlButton";
import WindowControls from "../src/window/WindowControls";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

afterEach(() => {
  if (typeof window !== "undefined") clearMocks();
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
});

function controls(isMaximized = false) {
  // These presentation functions have no Hooks. Exercise their actual event
  // handlers without pretending that SSR runs the titlebar Effects or native UI.
  return Children.toArray(WindowControls({ isMaximized }).props.children)
    .map((child) => (child as ReactElement<ComponentProps<typeof WindowControlButton>>).props);
}

function mockWindow(label: string, handler: Parameters<typeof mockIPC>[0]) {
  Object.defineProperty(globalThis, "window", { configurable: true, value: { crypto } });
  mockWindows(label);
  mockIPC(handler);
}

describe("fronteira nativa dos controles de janela", () => {
  test("shell pode ser importado e renderizado sem DOM nem inicialização Tauri", () => {
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");
    const html = renderToStaticMarkup(<AppShell><p>Conteúdo</p></AppShell>);
    expect(html).toContain("Conteúdo");
    expect(html).toContain('aria-label="Manter janela sempre no topo"');
    expect(html).toContain('aria-label="Minimizar janela"');
    expect(html).toContain('aria-label="Maximizar janela"');
    expect(html).toContain('aria-label="Fechar janela"');
    expect(html).toContain('aria-busy="true"');
  });

  test("resolve a janela somente ao executar cada ação e envia os comandos nativos corretos", async () => {
    const buttons = controls();
    const commands: Array<{ command: string; payload: unknown }> = [];
    mockWindow("primeira", (command, payload) => { commands.push({ command, payload }); });

    buttons[0].onClick();
    mockWindows("segunda");
    buttons[1].onClick();
    buttons[2].onClick();
    await Promise.resolve();

    expect(commands).toEqual([
      { command: "plugin:window|minimize", payload: { label: "primeira" } },
      { command: "plugin:window|toggle_maximize", payload: { label: "segunda" } },
      { command: "plugin:window|close", payload: { label: "segunda" } },
    ]);
    expect(controls(true)[1].ariaLabel).toBe("Restaurar janela");
  });

  test("falha de IPC é tratada e uma nova ação continua disponível", async () => {
    const failure = new Error("Falha nativa simulada");
    const error = spyOn(console, "error").mockImplementation(() => {});
    try {
      let attempts = 0;
      mockWindow("main", () => {
        if (++attempts === 1) throw failure;
      });
      const minimize = controls()[0].onClick;
      minimize();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(error).toHaveBeenCalledWith("Falha ao executar comando de janela:", failure);
      minimize();
      await Promise.resolve();
      expect(attempts).toBe(2);
      expect(error).toHaveBeenCalledTimes(1);
    } finally {
      error.mockRestore();
    }
  });

  test("falha síncrona ao obter a janela também fica no tratamento da ação", () => {
    Reflect.deleteProperty(globalThis, "window");
    const error = spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => controls()[0].onClick()).not.toThrow();
      expect(error).toHaveBeenCalledTimes(1);
    } finally {
      error.mockRestore();
    }
  });

  test("pin ocupado preserva o botão focalizável e bloqueia a ação repetida", () => {
    let calls = 0;
    const button = WindowControlButton({
      ariaLabel: "Fixar", children: "Pin", busy: true,
      onClick: () => { calls++; },
    });
    expect(button.props.disabled).toBe(false);
    expect(button.props["aria-disabled"]).toBe(true);
    expect(button.props["aria-busy"]).toBe(true);
    button.props.onClick();
    expect(calls).toBe(0);
  });
});
