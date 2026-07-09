export interface ICreateAppMenuOptions {
  id: string;
  icon: string;
  title: string;
}

export interface ICreateAppTabsMenuOptions {
  id: any;
  title: string;
  total: number;
}

export interface IButtonProps {
  /** 唯一key */
  key: string;
  /** 按钮名称 */
  name: string;
  /** 按钮icon */
  icon?: string;
  /** 使用自定义的组件 */
  useCustomizeCmp?: boolean;
  /** 按钮所属位置 */
  locationType?: ((info: Recordable<any>) => string) | string;
  /** 按钮样式 直接解构 */
  style?: {
    [k: string]: string | boolean;
  };
  /** 按钮样式 直接解构 */
  tableStyle?: {
    [k: string]: string | boolean;
  };
  /** 是否显示按钮 */
  isShow?: (info: Recordable<any>, opts?: Recordable<any>) => boolean;
  /** 点击按钮二次提示文案 */
  tips?: {
    [k: string]: string | ((content: string) => string);
  };
}

export interface IButtonConfig {
  [k: string]: IButtonProps;
}
