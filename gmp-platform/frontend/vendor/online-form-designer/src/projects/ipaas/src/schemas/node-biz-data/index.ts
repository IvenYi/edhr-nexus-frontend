function dynamicImportNodeBizDataSchemaMap() {
  const NodeBizDataSchemaMap = import.meta.glob(['./*.ts', '!./index.ts'], {
    eager: true,
  });

  const result = Object.keys(NodeBizDataSchemaMap).reduce((map, path) => {
    const name = path
      .match(/([a-zA-z\-0-9_]+)(?=.ts)/g)![0]
      .split('-')
      .reduce((str, cur, idx) => {
        // 转成小驼峰
        if (idx > 0) cur = cur.replace(/([a-zA-Z])/, (match, p1) => p1.toUpperCase());
        return str + cur;
      }, '');
    const { NodeBizDataConstant: config } = NodeBizDataSchemaMap[path] as any;
    map[name] = config;
    return map;
  }, {});

  return result;
}

export const NodeBizDataSchemaMap = dynamicImportNodeBizDataSchemaMap();
