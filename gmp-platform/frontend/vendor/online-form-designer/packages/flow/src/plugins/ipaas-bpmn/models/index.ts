const nodes: Record<string, any> = import.meta.glob('./*.ts', { eager: true });
const nodeModels = Object.keys(nodes).reduce((map, path) => {
  const name = path.match(/([a-zA-z\-0-9_]+)(?=.ts)/g)![0];
  map[name] = {
    ...nodes[path],
  };
  return map;
}, {});

export default nodeModels;
