export interface linkageItem {
  // 当前属性引用模型
  refModelKey?: string;
  refModelCategory?: string;
  // 当前属性归属模型
  modelKey: string;
  modelName?: string;
  modelCategory?: string;
  // 选中的节点的 id ，主要在查询中使用。查询中属性时可以重复的
  id?: string;
  // 选中的属性
  value: string;
  label: string;
  // 是否为结束节点
  end?: boolean;
  // 是否为反转节点
  reverse?: boolean;
  permissionEnabled?: boolean;
}
