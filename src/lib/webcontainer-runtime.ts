"use client";

import {
  type FileSystemTree,
  type WebContainerProcess,
  WebContainer,
} from "@webcontainer/api";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";

import type { LinuxPracticeGroup, TerminalWorkspaceSeedNode } from "@/lib/practice-data";

export type TerminalRuntimeSession = {
  shellProcess: WebContainerProcess;
  terminal: Terminal;
  fitAddon: FitAddon;
  inputWriter: WritableStreamDefaultWriter<string>;
  dispose: () => void;
  reset: () => Promise<TerminalRuntimeSession>;
};

export type TerminalRuntimeAdapter = {
  startSession: (
    group: LinuxPracticeGroup,
    terminalElement: HTMLElement,
    onCommand: (command: string) => void,
  ) => Promise<TerminalRuntimeSession>;
};

let activeContainer: WebContainer | null = null;

const HOME_PREFIX = "/home/learner";

function normalizeSeedPath(path: string) {
  if (path === HOME_PREFIX || path === "/") {
    return "";
  }

  if (path.startsWith(`${HOME_PREFIX}/`)) {
    return path.slice(HOME_PREFIX.length + 1);
  }

  return path.replace(/^\/+/, "");
}

function buildWorkspaceTree(nodes: TerminalWorkspaceSeedNode[]): FileSystemTree {
  const tree: FileSystemTree = {};

  for (const node of nodes) {
    const normalizedPath = normalizeSeedPath(node.path);
    const segments = normalizedPath ? normalizedPath.split("/") : [];
    const name = segments.pop();
    let cursor = tree;

    for (const segment of segments) {
      const entry = cursor[segment];

      if (!entry || !("directory" in entry)) {
        cursor[segment] = { directory: {} };
      }

      cursor = (cursor[segment] as { directory: FileSystemTree }).directory;
    }

    if (!name) {
      continue;
    }

    cursor[name] =
      node.type === "dir"
        ? { directory: {} }
        : { file: { contents: node.content ?? "" } };
  }

  return tree;
}

function normalizeInitialDirectory(path: string) {
  const normalized = normalizeSeedPath(path);
  return normalized.length ? normalized : ".";
}

async function bootFreshContainer() {
  if (activeContainer) {
    activeContainer.teardown();
    activeContainer = null;
  }

  activeContainer = await WebContainer.boot({
    coep: "require-corp",
    workdirName: "learner-home",
  });

  return activeContainer;
}

async function streamShellOutput(process: WebContainerProcess, terminal: Terminal) {
  try {
    await process.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data);
          window.requestAnimationFrame(() => {
            terminal.scrollToBottom();
          });
        },
      }),
    );
  } catch {
    // Process shutdown tears down the stream; nothing to surface here.
  }
}

function bindCommandTracking(
  terminal: Terminal,
  inputWriter: WritableStreamDefaultWriter<string>,
  onCommand: (command: string) => void,
) {
  let buffer = "";
  const scrollSoon = () => {
    window.requestAnimationFrame(() => {
      terminal.scrollToBottom();
    });
  };

  return terminal.onData((data) => {
    void inputWriter.write(data);
    scrollSoon();

    if (data === "\r") {
      const submitted = buffer.trim();
      buffer = "";

      if (submitted) {
        onCommand(submitted);
      }

      return;
    }

    if (data === "\u007f") {
      buffer = buffer.slice(0, -1);
      return;
    }

    if (data === "\u0003") {
      buffer = "";
      return;
    }

    if (data === "\n") {
      return;
    }

    if (data.startsWith("\u001b")) {
      return;
    }

    buffer += data;
  });
}

async function createRuntimeSession(
  group: LinuxPracticeGroup,
  terminalElement: HTMLElement,
  onCommand: (command: string) => void,
): Promise<TerminalRuntimeSession> {
  const container = await bootFreshContainer();
  const fitAddon = new FitAddon();
  const terminal = new Terminal({
    convertEol: true,
    cursorBlink: true,
    scrollback: 5000,
    fontFamily:
      '"SFMono-Regular", "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 14,
    lineHeight: 1.35,
    theme: {
      background: "#05080d",
      foreground: "#e7e5e4",
      cursor: "#86efac",
      selectionBackground: "#1f2937",
      black: "#0b1220",
      red: "#fb7185",
      green: "#86efac",
      yellow: "#fde047",
      blue: "#60a5fa",
      magenta: "#f9a8d4",
      cyan: "#67e8f9",
      white: "#f5f5f4",
      brightBlack: "#52525b",
      brightRed: "#fda4af",
      brightGreen: "#bbf7d0",
      brightYellow: "#fef08a",
      brightBlue: "#93c5fd",
      brightMagenta: "#fbcfe8",
      brightCyan: "#a5f3fc",
      brightWhite: "#ffffff",
    },
  });

  terminal.loadAddon(fitAddon);
  terminal.open(terminalElement);
  fitAddon.fit();
  const scrollAfterRenderDisposable = terminal.onWriteParsed(() => {
    window.requestAnimationFrame(() => {
      terminal.scrollToBottom();
    });
  });

  await container.mount(buildWorkspaceTree(group.seedNodes));

  const shellProcess = await container.spawn("jsh", {
    terminal: {
      cols: terminal.cols,
      rows: terminal.rows,
    },
  });

  void streamShellOutput(shellProcess, terminal);

  const inputWriter = shellProcess.input.getWriter();
  const inputDisposable = bindCommandTracking(terminal, inputWriter, onCommand);

  const resizeObserver = new ResizeObserver(() => {
    fitAddon.fit();
    shellProcess.resize({
      cols: terminal.cols,
      rows: terminal.rows,
    });
    window.requestAnimationFrame(() => {
      terminal.scrollToBottom();
    });
  });
  resizeObserver.observe(terminalElement);

  window.setTimeout(() => {
    fitAddon.fit();
    shellProcess.resize({
      cols: terminal.cols,
      rows: terminal.rows,
    });
    window.requestAnimationFrame(() => {
      terminal.scrollToBottom();
    });
  }, 0);

  const currentDir = normalizeInitialDirectory(group.initialCwd);

  if (currentDir !== ".") {
    await inputWriter.write(`cd ${currentDir}\n`);
  }

  return {
    shellProcess,
    terminal,
    fitAddon,
    inputWriter,
    dispose: () => {
      scrollAfterRenderDisposable.dispose();
      inputDisposable.dispose();
      resizeObserver.disconnect();
      shellProcess.kill();
      inputWriter.releaseLock();
      terminal.dispose();
    },
    reset: () => createRuntimeSession(group, terminalElement, onCommand),
  };
}

export const webcontainerRuntimeAdapter: TerminalRuntimeAdapter = {
  startSession: createRuntimeSession,
};
