const comps: IObject = {};

const modules: Record<string, any> = import.meta.glob('./**/*-form.vue', { eager: true });
for (const path in modules) {
  const module = modules[path];
  const cname = module.default.name || module.default.__name;
  comps[cname] = module.default;
}
export default comps;
