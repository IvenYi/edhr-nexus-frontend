export enum FlowNodeTypeEnum {
  /**
   * 通用节点
   */
  Flow = 'flow', // 流节点

  /**
   * 连接流节点
   */
  App = 'app', // 自定义
  Loop = 'loop', // 循环节点
  End = 'end', // 结束节点
  Bool = 'bool', // 判断节点
  Switch = 'switch', // 分支节点
  Condition = 'condition', // 条件节点
}

export enum EmitType {
  NodeClick = 'node-click',
  NodeCreate = 'node-create',
}

export enum IconType {
  app = 'icon-park:api-app',
  bool = 'icon-panduan',
  condition = 'icon-fenzhi',
  switch = 'icon-fenzhi',
  end = 'icon-jieshu',
  loop = 'icon-xunhuan',
  apiResponse = 'icon-a-APIjiekou_api2',
}

export enum IconTypeColor {
  app = '#3168ec',
  apiResponse = '#3168ec',
  bool = '#ffca38',
  condition = '#088C49',
  switch = '#088C49',
  end = '#f54547',
  loop = '#4c26cf',
}

export enum IconTypeBgColor {
  app = '#e6eeff',
  apiResponse = '#e6eeff',
  bool = '#fffaeb',
  condition = '#f1fefa',
  switch = '#f1fefa',
  end = '#fef5f5',
  loop = '#f4f2fd',
}

export enum FlowNodeInstStatus {
  COMPLETED = 'COMPLETED',
  RUNNING = 'RUNNING',
  PENDING = 'PENDING',
  EXCEPTION = 'EXCEPTION',
}

export const FlowNodeInstStatusColor = {
  [FlowNodeInstStatus.COMPLETED]: '#309C41',
  [FlowNodeInstStatus.RUNNING]: '#3168EC',
  [FlowNodeInstStatus.PENDING]: '#8F8F8F',
};
