const elementCallback = new WeakMap();
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const callback = elementCallback.get(entry.target);
    if (callback && typeof callback === 'function') {
      callback(entry);
    }
  }
});

function observe(element: Element, callback: (entry: ResizeObserverEntry) => void) {
  if (elementCallback.has(element)) return;
  observer.observe(element);
  elementCallback.set(element, callback);
}

function unobserve(element: Element) {
  if (!elementCallback.has(element)) return;
  observer.unobserve(element);
  elementCallback.delete(element);
}

function disconnect() {
  observer.disconnect();
}

export function useResizeObserver() {
  return {
    observe,
    unobserve,
    disconnect,
  };
}
