const noopRouter = {
  push: () => undefined,
  replace: () => undefined,
  getRoutes: () => [],
  hasRoute: () => false,
  removeRoute: () => undefined,
  addRoute: () => undefined,
};

export function getCurrentRouter() {
  return noopRouter;
}

export async function getProjectRoutesModules() {
  return [];
}

export function resetRouter() {}

export function useGo() {
  return () => undefined;
}

export function useRedo() {
  return () => undefined;
}
