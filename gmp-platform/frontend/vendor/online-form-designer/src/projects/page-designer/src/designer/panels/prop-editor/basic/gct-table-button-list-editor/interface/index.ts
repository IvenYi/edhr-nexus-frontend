import { LowCodeWidget } from '@gct/runtime';
import { operateSysEnums } from '../../../../../../enum';

export interface BaseButton extends LowCodeWidget.BasicSchema {
  props: RdoBaseButtonProps;
}

export interface RdoBaseButtonProps extends LowCodeWidget.WidgetProps {
  id: string;
  /**标题 */
  title: string;
  /**二次确认 */
  confirm?: boolean;
  confirmText?: string;
  /**内置事件 */
  innerEvent?: boolean;
  /**系统事件类型 */
  sysMethedType?: operateSysEnums;
  linkPage?: string;
  /**事件名称 */
  eventName?: string;
  /**显示规则 */
  // displayRule?: string;
  icon: string;
  iconColor: string;
  size: string;
  disabled: boolean;
  // btnType: ButtonTypeGroup;
  /**是否显示按钮名称 */
  hasText: boolean;
  /**是否显示图标 */
  hasIcon: boolean;
  /**按钮type */
  type: string;
  /**是否是危险类型 */
  danger: boolean;
  /**关联模型 */
  model?: string;
  i18nConfig?: string;
  // 0 为父版本，1 为子版本
  versionMode?: 0 | 1;
  // 0 单行按钮，1 头部按钮，2 批量操作按钮
  pos: 0 | 1 | 2;
  // 是否显示头部默认显示
  showHeader?: boolean;
}

export interface ButtonConfig extends LowCodeWidget.PropEditorConfig {
  /**
   * 标题
   *
   * @author zhanghanrui
   * @date 2024-05-30 14:05:22
   * @type {string}
   */
  title: string;
  /**
   * 子标题
   *
   * @author zhanghanrui
   * @date 2024-05-30 14:05:26
   * @type {string}
   */
  subTitle: string;
  /**
   * 描述
   *
   * @author zhanghanrui
   * @date 2024-05-30 14:05:35
   * @type {string}
   */
  desc?: string;

  /**
   * 默认显示最大数量
   *
   * @author zhanghanrui
   * @date 2024-05-30 15:05:21
   * @type {number}
   */
  defaultMaxCount?: number;

  /**
   * 计算位置的tag
   *
   * @author zhanghanrui
   * @date 2024-09-05 15:09:49
   * @param {*} data
   * @return {*}  {string}
   */
  calcPosTag(data: any): string;
}
