const comps: Record<string, any> = import.meta.glob('./*.vue', { eager: true });
const compMaps = Object.keys(comps).reduce((map, path) => {
  const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
  const rename = name.replace('bpmn', 'biz');
  map[rename] = {
    ...comps[path].default,
  };
  return map;
}, {});
export default compMaps;
