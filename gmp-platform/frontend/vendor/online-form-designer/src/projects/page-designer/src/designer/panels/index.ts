const panelComps = {};
const modules: Record<string, any> = import.meta.glob('./**/panel-*.vue', { eager: true });

for (const path in modules) {
  const name = modules[path].default.name;
  panelComps[name] = modules[path].default;
}
export default panelComps;
