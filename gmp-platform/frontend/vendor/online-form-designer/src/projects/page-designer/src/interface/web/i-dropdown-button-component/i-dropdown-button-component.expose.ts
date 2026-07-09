export interface IDropdownButtonState {
  /** 是否禁用主按钮 */
  disabled: boolean;
  /** 下拉菜单数据 */
  menuItems: Array<{ key: string; label: string }>;
}

/**
 * 下拉按钮
 *
 * @interface IDropdownButtonComponentExpose
 */
export interface IDropdownButtonComponentExpose {
  /** 获取状态 */
  getState(): IDropdownButtonState;
  /**
   * 设置状态
   *
   * @param newState 新状态
   */
  setState(newState: Partial<IDropdownButtonState>): void;
}
