import { useCallback, useRef, useState } from 'react';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

// Editor snapshots only: no business validation, persistence or version policy.
export class FlowHistory<T> {
  private past: T[] = [];
  private future: T[] = [];

  get counts() {
    return { undo: this.past.length, redo: this.future.length };
  }

  record(before: T) {
    this.past = [...this.past.slice(-49), clone(before)];
    this.future = [];
  }

  undo(current: T): T | undefined {
    if (!this.past.length) return undefined;
    this.future.push(clone(current));
    return this.past.pop();
  }

  redo(current: T): T | undefined {
    if (!this.future.length) return undefined;
    this.past.push(clone(current));
    return this.future.pop();
  }

  reset() {
    this.past = [];
    this.future = [];
  }
}

export function useFlowHistory<T>({ read, apply, editable }: {
  read: () => T;
  apply: (graph: T) => void;
  editable: boolean;
}) {
  const stack = useRef<FlowHistory<T> | null>(null);
  if (!stack.current) stack.current = new FlowHistory<T>();
  const [history, setHistory] = useState({ undo: 0, redo: 0 });
  const record = (before: T) => {
    stack.current!.record(before);
    setHistory(stack.current!.counts);
  };
  const reset = useCallback(() => {
    stack.current!.reset();
    setHistory(stack.current!.counts);
  }, []);
  const undo = () => {
    if (!editable) return;
    const graph = stack.current!.undo(read());
    if (graph === undefined) return;
    apply(graph);
    setHistory(stack.current!.counts);
  };
  const redo = () => {
    if (!editable) return;
    const graph = stack.current!.redo(read());
    if (graph === undefined) return;
    apply(graph);
    setHistory(stack.current!.counts);
  };
  return { history, record, reset, undo, redo };
}
