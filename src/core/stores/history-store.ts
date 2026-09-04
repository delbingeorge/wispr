import { create } from "zustand";
import type { Command } from "@/core/commands/types";

type HistoryState = {
  undoStack: Command[];
  redoStack: Command[];
  dispatch: (command: Command) => void;
  undo: () => void;
  redo: () => void;
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  undoStack: [],
  redoStack: [],

  dispatch: (command) => {
    command.execute();
    set((state) => ({
      undoStack: [...state.undoStack.slice(-99), command],
      redoStack: [],
    }));
  },

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;
    const command = undoStack[undoStack.length - 1];
    command.undo();

    set((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, command],
    }));
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return;
    const command = redoStack[redoStack.length - 1];
    command.undo();

    set((state) => ({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, command],
    }));
  },
}));
