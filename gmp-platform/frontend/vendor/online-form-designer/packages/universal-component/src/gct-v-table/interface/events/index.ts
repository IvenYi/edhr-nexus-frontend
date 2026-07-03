/**
 * 表格事件类型定义
 */
export type IGctVTableEvent = {
  /**
   * 关闭行编辑
   *
   * @type {boolean} true 为修改成功关闭，false 为取消关闭
   */
  closeEdit: boolean;
  /**
   * 行编辑保存成功事件
   *
   * @type {IObject[]}
   */
  editSaved: IObject[];
  /**
   * 行删除成功事件
   *
   * @type {IObject[]}
   */
  removed: IObject[];
};

/**
 * 表格编辑事件类型定义
 */
export type IGctVTableEditEvent = {};

/**
 * 正在编辑的表格行事件类型定义
 */
export type IGctVTableEditingRowEvent = {
  /**
   * 行数据变化事件
   *
   * @type {{ key: string; oldValue: any; newValue: any }}
   */
  change: { key: string; oldValue: any; newValue: any };
  /**
   * 赋值变化事件
   *
   * @type {{ key: string; state: boolean }}
   */
  assignmentChange: { key: string; state: boolean }
  /**
   * 禁用状态变化事件
   *
   * @type {{ key: string; state: boolean }}
   */
  disabledChange: { key: string; state: boolean };
  /**
   * 只读状态变化事件
   *
   * @type {{ key: string; state: boolean }}
   */
  readonlyChange: { key: string; state: boolean };
};

/**
 * 正在编辑的表格列事件类型定义
 */
export type IGctVTableEditingColEvent = {
  /**
   * 列值变化事件
   *
   * @type {{ oldValue: any; newValue: any }}
   */
  change: { oldValue: any; newValue: any };
  /**
   * 赋值变化事件
   *
   * @type {boolean}
   */
  assignmentChange: boolean;
  /**
   * 禁用状态变化事件
   *
   * @type {boolean}
   */
  disabledChange: boolean;
  /**
   * 只读状态变化事件
   *
   * @type {boolean}
   */
  readonlyChange: boolean;
};
