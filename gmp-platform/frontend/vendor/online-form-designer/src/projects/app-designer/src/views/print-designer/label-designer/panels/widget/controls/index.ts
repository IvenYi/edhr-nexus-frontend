const Comps = {};
const modules: Record<string, any> = import.meta.glob('./*.(vue|tsx)', { eager: true });

for (const path in modules) {
  const name = modules[path].default.name;
  Comps[name] = modules[path].default;
}
export default Comps;
