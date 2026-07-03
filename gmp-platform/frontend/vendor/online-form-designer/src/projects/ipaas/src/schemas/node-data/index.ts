function dynamicImportNodeDataSchemaMap() {
  const NodeDataSchemaMap = import.meta.glob('./node-*.ts', {
    eager: true,
  });

  const schemaMap = Object.keys(NodeDataSchemaMap).reduce((map, path) => {
    const name = path
      .match(/(?<=node-)([a-zA-z\-0-9_]+)(?=.ts)/g)![0]
      .split('-')
      .reduce((str, cur, idx) => {
        // 转成小驼峰
        if (idx > 0) cur = cur.replace(/([a-zA-Z])/, (match, p1) => p1.toUpperCase());
        return str + cur;
      }, '');
    // const config = NodeDataSchemaMap[path].NodeDataConstant;
    const { NodeDataConstant: config, validator } = NodeDataSchemaMap[path] as any;
    map[name] = {
      config,
      validator,
    };
    return map;
  }, {});

  return schemaMap;
}

export const NodeDataSchemaMap = dynamicImportNodeDataSchemaMap();
