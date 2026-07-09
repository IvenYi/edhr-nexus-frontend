const editors = {};
const modules: Record<string, any> = import.meta.glob('./**(!modals)/**/*-editor.(vue|tsx)', {
  eager: true,
});

for (const path in modules) {
  const name = modules[path].default.name;
  editors[name] = modules[path].default;
}
export default editors;
